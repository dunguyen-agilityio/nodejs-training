import { CartItem, Order, OrderItem, Product } from "#entities";
import { NotFoundError } from "#types/error";
import Stripe from "stripe";
import { AbstractCheckoutService } from "./type";
import { StripePaymentGatewayProvider } from "#providers";

export class CheckoutService extends AbstractCheckoutService<StripePaymentGatewayProvider> {
  async createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
  ): Promise<Stripe.PaymentIntent> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("Not found user");
    }

    if (!user.stripeId) {
      const { email, id: userId, firstName, lastName } = user;
      const stripeUser = await this.paymentGatewayProvider.createCustomer({
        email,
        name: `${firstName} ${lastName}`,
        metadata: { userId },
      });

      user.stripeId = stripeUser.id;
      await this.userRepository.save(user);
    }

    return await this.paymentGatewayProvider.createPaymentIntents({
      ...payload,
      customer: user.stripeId,
    });
  }

  async checkout(stripeId: string, paymentIntentId: string): Promise<boolean> {
    const user = await this.userRepository.getByStripeId(stripeId);
    if (!user) throw new NotFoundError("User not found");

    const paymentIntent =
      await this.paymentGatewayProvider.getPaymentIntents(paymentIntentId);

    if (!paymentIntent) throw new NotFoundError("Payment intent not found");

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment intent not succeeded");
    }

    const cart = await this.cartRepository.getCartByUserId(user.id);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new NotFoundError("Cart is empty");
    }

    // Start transaction
    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const totalAmount = await cart.items.reduce(async (sumPromise, item) => {
        const sum = await sumPromise;
        const product = await this.productRepository.getById(item.product.id);

        if (!product) throw new NotFoundError("Product not found");
        return sum + item.quantity * product.price;
      }, Promise.resolve(0));

      // Create order
      const order = await queryRunner.manager.save(
        queryRunner.manager.create(Order, {
          user,
          status: "paid",
          totalAmount,
        }),
      );
      // Create order items and decrease stock
      const orderItems = await Promise.all(
        cart.items.map(async (cartItem) => {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: cartItem.product.id },
          });

          if (!product) {
            throw new NotFoundError(`Product ${cartItem.product.id} not found`);
          }

          if (product.stock < cartItem.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
          // Decrease stock
          product.stock -= cartItem.quantity;
          await queryRunner.manager.save(product);

          // Create order item
          return queryRunner.manager.create(OrderItem, {
            order,
            priceAtPurchase: product.price,
            product,
            quantity: cartItem.quantity,
          });
        }),
      );

      await queryRunner.manager.save(orderItems);

      // Clear cart items
      await queryRunner.manager.delete(CartItem, { cartId: cart.id });
      // Commit transaction
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

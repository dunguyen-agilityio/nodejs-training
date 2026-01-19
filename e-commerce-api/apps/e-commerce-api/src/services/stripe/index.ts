import Stripe from "stripe";
import {
  PaymentService as AbstractPayment,
  Customer,
  CustomerCreateParams,
  PaymentIntent,
  PaymentIntentCreateParams,
} from "./type";
import { convertToSubcurrency } from "#utils/convertToSubcurrency";
import { CartItem, Order, OrderItem, Product, User } from "#entities";

import { NotFoundError } from "#types/error";

export class StripePaymentService extends AbstractPayment {
  stripe: Stripe;

  constructor(repositories: any) {
    super(repositories);

    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_API_KEY environment variable is required");
    }
    this.stripe = new Stripe(apiKey);
  }

  async createPaymentIntent({
    amount,
    currency,
    customer,
  }: PaymentIntentCreateParams): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: convertToSubcurrency(amount),
      currency: currency,
      automatic_payment_methods: { enabled: true },
      customer: customer,
    });

    return paymentIntent;
  }

  async createCustomer({
    email,
    ...params
  }: CustomerCreateParams): Promise<Customer> {
    const customer = await this.stripe.customers.create({
      email,
      ...params,
    });

    return customer;
  }

  getUserByStripeId(stripeId: string): Promise<User | null> {
    return this.userRepository.getByStripeId(stripeId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.getCartByUserId(userId);
    if (!cart) return;

    await this.cartItemRepository.deleteByCartId(cart.id);
  }

  async checkout(stripeId: string, paymentIntentId: string): Promise<void> {
    const user = await this.userRepository.getByStripeId(stripeId);
    if (!user) throw new NotFoundError("User not found");
    const userId = user.id;

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) throw new NotFoundError("Payment intent not found");

    if (paymentIntent.status !== "succeeded")
      throw new Error("Payment intent not succeeded");

    const cart = await this.cartRepository.getCartByUserId(userId);
    if (!cart) throw new NotFoundError("Cart not found");

    const totalAmount = cart.items.reduce(
      (prev, item) => prev + item.quantity * item.product.price,
      0
    );

    const order = this.orderRepository.create({
      user,
      status: "paid",
      totalAmount,
    });

    const cartItemPromises = cart.items.map(async (item) => {
      const product = await this.productRepository.getById(item.product.id);
      if (!product) throw new NotFoundError("Product not found");

      this.orderItemRepository.create({
        order,
        priceAtPurchase: product.price,
        productId: product.id,
        quantity: item.quantity,
      });

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      await this.productRepository.decreaseStock(product.id, item.quantity);

      await this.cartItemRepository.delete(item.id);
    });

    await this.orderRepository.save(order);

    await Promise.all(cartItemPromises);

    await this.clearCart(userId);
  }

  async checkout1(stripeId: string, paymentIntentId: string): Promise<void> {
    console.log(stripeId, "stripeId");
    const user = await this.userRepository.getByStripeId(stripeId);
    if (!user) throw new NotFoundError("User not found");

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

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
      const order = queryRunner.manager.create(Order, {
        user: user,
        status: "paid",
        totalAmount,
      });

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
            productId: product.id,
            quantity: cartItem.quantity,
          });
        })
      );
      order.items = orderItems;
      await queryRunner.manager.save(order);

      // Clear cart items
      await queryRunner.manager.delete(CartItem, { cartId: cart.id });
      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      // throw error;
      console.log("error", error);
    } finally {
      await queryRunner.release();
    }
  }
}

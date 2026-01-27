import { CartItem, Order, OrderItem, Product, User } from "#entities";
import { NotFoundError } from "#types/error";
import Stripe from "stripe";
import { ICheckoutService } from "./type";
import {
  CartRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import { StripePaymentGatewayProvider } from "#providers";
import { Dependencies } from "#services/base";
import { Response } from "#types/payment";
import { IMailProvider } from "#providers/types";
import { Invoice } from "#types/invoice";
import { IUserService } from "#services/types";
import { formatStripeAmount, formatStripeDate } from "#utils/format";

export class CheckoutService implements ICheckoutService {
  private userRepository: UserRepository;
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;
  private paymentGatewayProvider: StripePaymentGatewayProvider;
  private mailProvider: IMailProvider;

  constructor(dependencies: Dependencies) {
    Object.assign(this, dependencies);
  }

  async createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
  ): Promise<Response<Invoice>> {
    const user = await this.userRepository.getUserRelationsById(userId);

    if (!user) {
      throw new NotFoundError("Not found user");
    }

    const { stripeId, cart } = user;

    if (!stripeId) {
      const { email, firstName, lastName } = user;
      const stripeUser = await this.paymentGatewayProvider.findOrCreateCustomer(
        {
          email,
          name: `${firstName} ${lastName}`,
        },
      );

      user.stripeId = stripeUser.id;
      await this.userRepository.save(user);
    }

    if (!cart || !cart.items.length) {
      throw new NotFoundError("Cart is empty");
    }

    const { currency } = payload;
    const cartItems = cart.items;

    const invoice = await this.paymentGatewayProvider.createInvoice({
      currency,
      customer: user.stripeId,
    });

    await Promise.all(
      cartItems.map(({ quantity, product: { price, name, id: productId } }) =>
        this.paymentGatewayProvider.createInvoiceItem({
          invoice: invoice.id,
          description: name,
          customer: user.stripeId,
          price_data: {
            currency,
            product: productId.toString(),
            unit_amount: Math.round(price * 1000),
          },
          quantity,
        }),
      ),
    );

    return await this.paymentGatewayProvider.finalizeInvoice(invoice.id);
  }

  async checkout(
    stripeId: string,
    paymentIntentId: string,
    userService: IUserService,
  ): Promise<boolean> {
    const user = await userService.getUserByStripeId(stripeId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { id: userId } = user;
    const paymentIntent =
      await this.paymentGatewayProvider.getPaymentIntents(paymentIntentId);

    if (!paymentIntent) throw new NotFoundError("Payment intent not found");

    if (paymentIntent.status !== "succeeded")
      throw new Error("Payment intent not succeeded");

    const cart = await this.cartRepository.getCartByUserId(userId);

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
          user: { id: userId },
          status: "paid",
          totalAmount,
        }),
      );

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
      await queryRunner.commitTransaction();

      // const { name, email } = user;

      //   this.paymentGatewayProvider.getInvoice()

      //  const {amount, created,} =  paymentIntent
      //   await this.mailProvider
      //     .sendWithTemplate({
      //       from: process.env.SENDGRID_FROM_EMAIL!,
      //       templateId: process.env.SENDGRID_TEMPLATE_REGISTER_SUCCESS!,
      //       to: email,
      //       dynamicTemplateData: {
      //         name,
      //         email,
      //         company_name: process.env.APP_NAME,
      //         support_email: process.env.SENDGRID_SUPPORT_EMAIL,
      //         amount_paid: "$121.00",
      //         paid_date: "January 21, 2026",
      //         receipt_number: "2383-4080",
      //         invoice_number: "CBAMGZRJ-0001",
      //         payment_method: "VISA •••• 4242",
      //         invoice_url: "https://example.com/invoice",
      //         receipt_url: "https://example.com/receipt",
      //         items: [
      //           {
      //             name: "Product 1",
      //             quantity: 3,
      //             unit_price: "$23.00",
      //             total: "$69.00",
      //           },
      //           {
      //             name: "Product 2",
      //             quantity: 4,
      //             unit_price: "$13.00",
      //             total: "$52.00",
      //           },
      //         ],
      //       },
      //     })
      //     .then((e) => {
      //       console.log(e);
      //     });

      return true;
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkout1(
    stripeId: string,
    invoiceId: string,
    userService: IUserService,
  ): Promise<boolean> {
    const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId);

    const invoicePaymentId = invoice.payments?.data[0]?.id;

    if (!invoicePaymentId) {
      throw new NotFoundError("User not found");
    }

    const invoicePayment =
      await this.paymentGatewayProvider.getInvoicePayment(invoicePaymentId);

    const { card } =
      invoicePayment.payment?.payment_intent?.payment_method || {};

    if (!card) {
      throw new NotFoundError("User not found");
    }

    //   if (!payment_method) {
    //     throw new NotFoundError("User not found");
    //   }

    // const paymethod = await  this.paymentGatewayProvider.getPaymentMethod(
    //     typeof payment_method === "string" ? payment_method : payment_method.id,
    //   );

    //  (await this.stripe.paymentMethods.retrieve('')).card?.last4
    // console.log(
    //   (await this.stripe.paymentIntents.retrieve("pi_3Su9F62fECJWDqwm1RIuEvYm"))
    //     .payment_method,
    //   (await this.stripe.paymentMethods.retrieve("pm_1Su9F42fECJWDqwmOXM7JaOy"))
    //     .card?.brand,

    //   "  (await this.stripe.invoicePayments.retrieve('in_1Su93C2fECJWDqwmbQFmQrcw')).payment.type",
    // );

    const user = await userService.getUserByStripeId(stripeId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { id: userId } = user;

    if (!invoice) throw new NotFoundError("Invoice not found");

    if (invoice.status !== "paid") throw new Error("Invoice yet paid");

    const cart = await this.cartRepository.getCartByUserId(userId);

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
          user: { id: userId },
          status: "paid",
          totalAmount,
        }),
      );

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
      await queryRunner.commitTransaction();

      const {
        currency,
        total,
        number,
        customer_email,
        customer_name,
        status_transitions,
      } = invoice;

      await this.mailProvider
        .sendWithTemplate({
          from: process.env.SENDGRID_FROM_EMAIL!,
          templateId: process.env.SENDGRID_TEMPLATE_REGISTER_SUCCESS!,
          to: customer_email ?? user.email,
          dynamicTemplateData: {
            name: customer_name ?? user.name,
            email: customer_email ?? user.email,
            company_name: process.env.APP_NAME,
            support_email: process.env.SENDGRID_SUPPORT_EMAIL,
            amount_paid: formatStripeAmount(total, currency),
            paid_date: formatStripeDate(
              status_transitions?.paid_at || Date.now(),
            ),
            receipt_number: "2383-4080",
            invoice_number: number,
            payment_method: `${card.brand.toUpperCase()} •••• ${card.last4}`,
            invoice_url: "https://example.com/invoice",
            receipt_url: "https://example.com/receipt",
            items: [
              {
                name: "Product 1",
                quantity: 3,
                unit_price: "$23.00",
                total: "$69.00",
              },
              {
                name: "Product 2",
                quantity: 4,
                unit_price: "$13.00",
                total: "$52.00",
              },
            ],
          },
        })
        .then((e) => {
          console.log(e);
        });

      return true;
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    return true;
  }
}

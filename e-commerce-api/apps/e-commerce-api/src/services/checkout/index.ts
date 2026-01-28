import { OrderItem } from "#entities";
import { NotFoundError, UnexpectedError } from "#types/error";
import Stripe from "stripe";
import { ICheckoutService } from "./type";
import {
  CartItemRepository,
  CartRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import { StripePaymentGatewayProvider } from "#providers";
import { Dependencies } from "#services/base";
import { Response } from "#types/payment";
import { IMailProvider } from "#providers/types";
import { Invoice, PaymentMethodType } from "#types/invoice";

import {
  formatAmount,
  formatPaymentMethod,
  formatStripeAmount,
  formatStripeDate,
} from "#utils/format";

export class CheckoutService implements ICheckoutService {
  private userRepository: UserRepository;
  private cartRepository: CartRepository;
  private cartItemRepository: CartItemRepository;
  private orderRepository: OrderRepository;
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
    try {
      const user = await this.userRepository.getUserRelationsById(userId);

      if (!user) {
        throw new NotFoundError("Not found user");
      }

      const { stripeId, cart } = user;

      if (!stripeId) {
        const { email, firstName, lastName } = user;
        const stripeUser =
          await this.paymentGatewayProvider.findOrCreateCustomer({
            email,
            name: `${firstName} ${lastName}`,
          });

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
        cartItems.map(({ quantity, product: { price, name } }) =>
          this.paymentGatewayProvider.createInvoiceItem({
            invoice: invoice.id,
            description: name,
            customer: user.stripeId,
            amount: Math.round(price * 100) * quantity, // to cents
          }),
        ),
      );

      const finalizeInvoice = await this.paymentGatewayProvider.finalizeInvoice(
        invoice.id,
      );
      return finalizeInvoice;
    } catch (error) {
      console.error("Error - createCheckoutPayment: ", error);
      throw error;
    }
  }

  async checkout(stripeId: string, invoiceId: string): Promise<boolean> {
    const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId);

    const invoicePaymentId = invoice.payments?.data[0]?.id;

    if (!invoicePaymentId) {
      throw new NotFoundError("Invoice Payment not found");
    }

    const invoicePayment =
      await this.paymentGatewayProvider.getInvoicePayment(invoicePaymentId);

    const { latest_charge } = invoicePayment.payment.payment_intent || {};
    if (!latest_charge) {
      throw new UnexpectedError("Missing latest charge");
    }

    const { receipt_url } = latest_charge;

    const { payment_method } = invoicePayment.payment?.payment_intent || {};

    if (!payment_method) {
      throw new NotFoundError("Payment method not found");
    }

    const user = await this.userRepository.getByStripeId(stripeId);

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
      const order = await this.orderRepository.createOrder(
        queryRunner,
        userId,
        {
          status: "paid",
          totalAmount,
        },
      );

      const orderItems = await Promise.all(
        cart.items.map(async ({ product, quantity }) => {
          const { id: productId } = product;
          await this.productRepository.decreaseStock(
            queryRunner,
            productId,
            quantity,
          );

          // Create order item
          return queryRunner.manager.create(OrderItem, {
            order,
            priceAtPurchase: product.price,
            product,
            quantity: quantity,
          });
        }),
      );

      await queryRunner.manager.save(orderItems);

      // Clear cart items
      await this.cartItemRepository.clearCartItems(queryRunner, cart.id);

      await queryRunner.commitTransaction();

      const {
        currency,
        total,
        number,
        customer_email,
        customer_name,
        status_transitions,
        invoice_pdf,
        receipt_number,
      } = invoice;

      const message = {
        from: process.env.SENDGRID_FROM_EMAIL!,
        templateId: process.env.SENDGRID_TEMPLATE_ORDER_SUCCESS!,
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
          receipt_number,
          invoice_number: number,
          payment_method: formatPaymentMethod(
            payment_method.type as PaymentMethodType,
            payment_method,
          ),
          invoice_url: invoice_pdf,
          receipt_url,
          items: orderItems.map(({ product, quantity }) => ({
            name: product.name,
            quantity: quantity,
            unit_price: formatAmount(product.price, currency),
            total: formatAmount(product.price * quantity, currency),
          })),
        },
      };

      await this.mailProvider.sendWithTemplate(message);

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

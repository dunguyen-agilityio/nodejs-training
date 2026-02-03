import {
  Cart,
  CartItem,
  Invoice as InvoiceEntity,
  InvoiceItem,
  OrderItem,
  Product,
  StockReservation,
} from "#entities";
import { NotFoundError, UnexpectedError } from "#types/error";
import Stripe from "stripe";
import { ICheckoutService } from "./type";
import {
  CartItemRepository,
  CartRepository,
  OrderRepository,
  UserRepository,
} from "#repositories/types";

import { PaymentDetails, PaymentGateway, Response } from "#types/payment";
import { IMailProvider } from "#providers/types";
import {
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentMethodType,
} from "#types/invoice";

import {
  formatPaymentMethod,
  formatStripeAmount,
  formatStripeDate,
} from "#utils/format";
import dayjs from "dayjs";
import { StockReservationStatus } from "#types/checkout";
import { QueryRunner } from "typeorm";

/**
 * @description Service responsible for handling all checkout-related operations,
 * including stock reservation, payment intent creation, local invoice management,
 * and order fulfillment after successful payment.
 */
export class CheckoutService implements ICheckoutService {
  constructor(
    private userRepository: UserRepository,
    private cartRepository: CartRepository,
    private orderRepository: OrderRepository,
    private paymentGatewayProvider: PaymentGateway,
    private mailProvider: IMailProvider,
  ) { }

  /**
   * @description Prepares the user's cart for checkout by reserving stock for each item.
   * This method initiates a database transaction to ensure atomicity.
   * @param userId The ID of the user whose cart is being prepared.
   */
  private async _prepareCheckout(userId: string): Promise<Cart> {
    const queryRuner =
      this.cartRepository.manager.connection.createQueryRunner();

    try {
      await queryRuner.connect();
      await queryRuner.startTransaction();

      const cart = await queryRuner.manager
        .createQueryBuilder(Cart, "cart")
        .setLock("pessimistic_write")
        .where("cart.user_id = :userId", { userId: userId })
        .getOne();

      if (!cart || cart.status !== "active") {
        throw new UnexpectedError("Cart not payable");
      }

      const cartItems = await queryRuner.manager.createQueryBuilder(CartItem, "cartItem")
        .where("cartItem.cart_id = :cartId", { cartId: cart.id })
        .leftJoinAndSelect("cartItem.product", "product")
        .getMany();

      await this._reserveStock(queryRuner, cart.id, cartItems);

      await queryRuner.commitTransaction();
      return { ...cart, items: cartItems };
    } catch (error) {
      console.error("Error: ", error);
      await queryRuner.rollbackTransaction();
      throw new UnexpectedError("Failed to prepare Checkout");
    } finally {
      await queryRuner.release();
    }
  }

  /**
   * @method _reserveStock
   * @description Reserves stock for products in the cart. This is a private helper method for `prepareCheckout`.
   * It checks for available stock and creates stock reservations.
   * @param queryRuner The TypeORM QueryRunner for transaction management.
   * @param cartId The ID of the cart for which stock is being reserved.
   * @param cartItems The items in the cart.
   * @throws {Error} If any product is out of stock.
   */
  private async _reserveStock(
    queryRuner: QueryRunner,
    cartId: number,
    cartItems: CartItem[],
  ) {
    const productIds = cartItems.map((i) => i.product.id);

    const products = await queryRuner.manager
      .createQueryBuilder(Product, "product")
      .setLock("pessimistic_write")
      .where("product.id IN (:...ids)", { ids: productIds })
      .getMany();

    const quantityMap: Record<string, number> = {};

    for (const item of cartItems) {
      const productId = item.product.id;
      quantityMap[productId] = (quantityMap[productId] ?? 0) + item.quantity;
    }

    for (const product of products) {
      const need = quantityMap[product.id]!;
      const available = product.stock - product.reservedStock;

      if (available < need) {
        throw new Error("Out of stock");
      }

      product.reservedStock += need;

      const reservation = queryRuner.manager.create(StockReservation, {
        cartId,
        productId: product.id,
        quantity: need,
        status: StockReservationStatus.RESERVED,
        expiresAt: dayjs().add(15, "minute").toDate(),
      });

      await queryRuner.manager.save(reservation);
    }

    await queryRuner.manager.save(products);
  }

  /**
   * @description Creates a local representation of the Stripe invoice in the application's database.
   * It initiates a database transaction to ensure atomicity.
   * @param userId The ID of the user.
   * @param cart The user's cart.
   * @param paymentInvoice The Stripe Invoice object.
   * @throws {UnexpectedError} If creating the local invoice fails.
   */
  private async _createLocalInvoice(
    userId: string,
    cart: Cart,
    paymentInvoice: Invoice,
  ) {
    const { id: cartId, items } = cart;
    const { lines, currency, total, id: invoiceId } = paymentInvoice;

    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const invoice = queryRunner.manager.create(InvoiceEntity, {
        cartId,
        currency,
        status: InvoiceStatus.OPEN,
        totalAmount: total,
        userId,
        id: invoiceId,
      });

      await this._createInvoiceItems(
        queryRunner,
        invoice.id,
        items,
        lines.data,
      );

      await queryRunner.manager.save(invoice);

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
      throw new UnexpectedError("Failed to create local invoice");
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @method _createInvoiceItems
   * @description Private helper method to create and save local invoice items within a transaction.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param invoiceId The ID of the local invoice.
   * @param cartItems The cart items to convert into invoice items.
   * @param invoiceLineItems The line items from the Stripe invoice.
   */
  private async _createInvoiceItems(
    queryRunner: QueryRunner,
    invoiceId: string,
    cartItems: CartItem[],
    invoiceLineItems: InvoiceLineItem[],
  ) {
    try {
      const itemMap: Record<string, InvoiceLineItem> = {};
      for (const line of invoiceLineItems) {
        const { product } = line.pricing?.price_details || {};
        if (product) {
          itemMap[product] = line;
        }
      }

      for (const item of cartItems) {
        const line = itemMap[item.product.id];
        const total = parseFloat((line?.subtotal || 0).toString());

        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          invoiceId,
          name: item.product.name,
          productId: item.product.id,
          quantity: item.quantity,
          total,
          unitPrice: total / item.quantity,
          id: line?.id,
        });

        await queryRunner.manager.save(invoiceItem);
      }
    } catch (error) {
      console.log(error);
      throw new UnexpectedError("Failed to create local invoice items");
    }
  }

  /**
   * @method generatePaymentIntent
   * @description Generates a Stripe Payment Intent for preview purposes.
   * This involves preparing the checkout (reserving stock) and creating a Stripe invoice.
   * @param payload Stripe PaymentIntent creation parameters (e.g., currency).
   * @param userId The ID of the user.
   * @param userStripeId The Stripe customer ID of the user.
   * @returns A Promise that resolves to the Stripe Invoice object containing the client secret.
   * @throws {NotFoundError} If the cart is not found.
   */
  async generatePaymentIntent(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
    userStripeId: string,
  ): Promise<Response<Invoice>> {
    const cart = await this.cartRepository.getCartByUserId(userId);

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const { currency } = payload;

    const invoice = await this.paymentGatewayProvider.createInvoice({
      currency,
      customer: userStripeId,
    });

    await Promise.all(
      cart.items.map(({ quantity, product: { price, name, id: productId } }) =>
        this.paymentGatewayProvider.createInvoiceItem({
          invoice: invoice.id,
          description: name,
          customer: userStripeId,
          quantity,
          price_data: {
            currency,
            product: productId.toString(),
            unit_amount: price * 100,
          },
        }),
      ),
    );

    const finalizeInvoice = await this.paymentGatewayProvider.finalizeInvoice(
      invoice.id,
    );

    return finalizeInvoice;
  }

  /**
   * @method prepareOrderForPayment
   * @description Prepares the order for payment by preparing the checkout (reserving stock)
   * and creating a local invoice based on an existing opened Stripe invoice.
   * @param userId The ID of the user.
   * @param stripeId The Stripe customer ID of the user.
   * @returns A Promise that resolves to the Stripe Invoice object.
   */
  async prepareOrderForPayment(
    userId: string,
    stripeId: string,
  ): Promise<Invoice> {
    const cart = await this._prepareCheckout(userId);

    const invoice =
      await this.paymentGatewayProvider.getOpenedInvoiceByUser(stripeId);

    await this._createLocalInvoice(userId, cart, invoice);

    return invoice;
  }

  /**
   * @description Handles the post-payment logic after a successful Stripe webhook event.
   * This method finalizes the order by updating stock, creating an order in the database,
   * clearing the cart, and sending a confirmation email. It operates within a transaction.
   * @param stripeId The Stripe customer ID.
   * @param invoiceId The Stripe Invoice ID.
   */
  async handleSuccessfulPayment(
    stripeId: string,
    invoiceId: string,
  ): Promise<void> {
    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepository.getByStripeId(stripeId);
      if (!user) throw new NotFoundError("User not found");

      const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId);
      if (!invoice || invoice.status !== "paid") {
        throw new UnexpectedError("Invoice not paid or not found");
      }

      const cart = await this._getCart(queryRunner, user.id);
      if (!cart) return;

      const { paymentDetails, invoiceItems } =
        await this._getPaymentDetailsAndItems(invoiceId, invoice);

      await this._updateStockAndReservations(queryRunner, cart.id);
      await this._createOrder(queryRunner, user.id, invoice, invoiceItems);
      await this._updateLocalInvoice(queryRunner, invoice.id, paymentDetails);
      await queryRunner.manager.delete(CartItem, { cartId: cart.id });

      await queryRunner.commitTransaction();

      const {
        currency,
        total,
        number: invoice_number,
        receipt_number,
        invoice_pdf,
      } = invoice;
      const { email, name } = user;
      const { paid_at, payment_method, receipt_url } = paymentDetails;

      const formattedPaymenMethod = formatPaymentMethod(
        payment_method.type as PaymentMethodType,
        payment_method,
      );

      await this._sendConfirmationEmail(invoiceItems, {
        currency,
        customer_email: email,
        customer_name: name,
        invoice_url: invoice_pdf!,
        invoice_number: invoice_number!,
        paid_at,
        payment_method: formattedPaymenMethod,
        receipt_number: receipt_number!,
        receipt_url,
        total,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description Private helper method to retrieve an active cart for a user within a transaction.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param userId The ID of the user.
   */
  private async _getCart(queryRunner: QueryRunner, userId: string) {
    const cart = await queryRunner.manager
      .createQueryBuilder(Cart, "cart")
      .setLock("pessimistic_write")
      .where("cart.user_id = :userId", { userId })
      .getOne();

    if (!cart || cart.status !== "active") {
      return null;
    }
    return cart;
  }

  /**
   * @description Private helper method to fetch payment details and local invoice items from Stripe.
   * @param invoiceId The Stripe Invoice ID.
   * @param invoice The Stripe Invoice object.
   */
  private async _getPaymentDetailsAndItems(
    invoiceId: string,
    invoice: Response<Invoice>,
  ): Promise<{ paymentDetails: PaymentDetails; invoiceItems: InvoiceItem[] }> {
    const { payments } = invoice;
    const { id: invoicePaymentId } = payments?.data[0] || {};
    if (!invoicePaymentId) throw new NotFoundError("Invoice Payment not found");

    const invoicePayment =
      await this.paymentGatewayProvider.getInvoicePayment(invoicePaymentId);
    const { payment, status_transitions } = invoicePayment || {};
    const {
      latest_charge,
      payment_method,
      id: paymentIntentId,
    } = payment.payment_intent || {};
    if (!latest_charge) throw new UnexpectedError("Missing latest charge");

    const invoiceItems = await this.cartRepository.manager.find(InvoiceItem, {
      where: { invoiceId },
    });

    return {
      paymentDetails: {
        receipt_url: latest_charge.receipt_url!,
        payment_method,
        paymentIntentId,
        paid_at: status_transitions.paid_at!,
      },
      invoiceItems,
    };
  }

  /**
   * @description Private helper method to update product stock and convert stock reservations
   * to a 'converted' status after a successful order.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param cartId The ID of the cart associated with the order.
   */
  private async _updateStockAndReservations(
    queryRunner: QueryRunner,
    cartId: number,
  ) {
    const reservations = await queryRunner.manager
      .createQueryBuilder(StockReservation, "sr")
      .setLock("pessimistic_write")
      .where("sr.cart_id = :cartId", { cartId })
      .andWhere("sr.status = 'reserved'")
      .getMany();

    const productIds = reservations.map((r: StockReservation) => r.productId);

    const products = await queryRunner.manager
      .createQueryBuilder(Product, "product")
      .setLock("pessimistic_write")
      .where("product.id IN (:...ids)", { ids: productIds })
      .getMany();

    const productMap: Record<string, Product> = {};
    for (const p of products) {
      productMap[p.id] = p;
    }

    for (const r of reservations) {
      const product = productMap[r.productId]!;
      product.stock -= r.quantity;
      product.reservedStock -= r.quantity;
      r.status = StockReservationStatus.CONVERTED;
    }

    await queryRunner.manager.save(products);
    await queryRunner.manager.save(reservations);
  }

  /**
   * @description Private helper method to create an order and its associated order items
   * in the database after a successful payment.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param userId The ID of the user placing the order.
   * @param invoice The Stripe Invoice object related to the payment.
   * @param invoiceItems The local InvoiceItem entities for the order.
   */
  private async _createOrder(
    queryRunner: QueryRunner,
    userId: string,
    invoice: Response<Invoice>,
    invoiceItems: InvoiceItem[],
  ) {
    const totalAmount = invoiceItems.reduce(
      (prev, item) => prev + item.total,
      0,
    );

    const order = await this.orderRepository.createOrder(queryRunner, userId, {
      status: "processing",
      totalAmount,
      invoiceId: invoice.id,
    });

    const orderItems = await Promise.all(
      invoiceItems.map(async ({ unitPrice, quantity, productId }) => {
        return queryRunner.manager.create(OrderItem, {
          order,
          priceAtPurchase: unitPrice,
          product: { id: productId },
          quantity,
        });
      }),
    );

    await queryRunner.manager.save(orderItems);
    return order;
  }

  /**
   * @description Private helper method to update the status and payment details
   * of the local invoice after a successful payment.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param invoiceId The ID of the local invoice to update.
   * @param paymentDetails An object containing payment-related details (e.g., paid_at, paymentIntentId).
   */
  private async _updateLocalInvoice(
    queryRunner: QueryRunner,
    invoiceId: string,
    paymentDetails: PaymentDetails,
  ) {
    await queryRunner.manager.update(InvoiceEntity, invoiceId, {
      status: InvoiceStatus.PAID,
      paidAt: new Date((paymentDetails.paid_at || Date.now()) * 1000),
      paymentIntentId: paymentDetails.paymentIntentId,
    });
  }

  /**
   * @method _sendConfirmationEmail
   * @description Private helper method to send a payment confirmation email to the user.
   * @param invoiceItems The local InvoiceItem entities.
   */
  private async _sendConfirmationEmail(
    invoiceItems: InvoiceItem[],
    {
      paid_at,
      receipt_url,
      customer_email,
      customer_name,
      invoice_url,
      payment_method,
      receipt_number,
      invoice_number,
      currency,
      total,
    }: {
      paid_at: number;
      receipt_url: string;
      payment_method: string;
      receipt_number: string;
      invoice_url: string;
      customer_name: string;
      customer_email: string;
      invoice_number: string;
      currency: string;
      total: number;
    },
  ) {
    const message = {
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: process.env.SENDGRID_TEMPLATE_ORDER_SUCCESS!,
      to: customer_email,
      dynamicTemplateData: {
        name: customer_name,
        email: customer_email,
        company_name: process.env.APP_NAME,
        support_email: process.env.SENDGRID_SUPPORT_EMAIL,
        amount_paid: formatStripeAmount(total, currency),
        paid_date: formatStripeDate(paid_at || Date.now()),
        receipt_number,
        invoice_number,
        payment_method,
        invoice_url,
        receipt_url: receipt_url,
        items: invoiceItems.map(({ unitPrice, quantity, total, name }) => ({
          quantity,
          unit_price: formatStripeAmount(unitPrice, currency),
          total: formatStripeAmount(total, currency),
          name,
        })),
      },
    };

    await this.mailProvider.sendWithTemplate(message);
  }
}

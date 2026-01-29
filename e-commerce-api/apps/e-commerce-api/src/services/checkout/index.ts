import {
  Cart,
  CartItem,
  Invoice as InvoiceEntity,
  InvoiceItem,
  OrderItem,
  Product,
  StockReservation,
  User,
} from "#entities";
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
import {
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentMethodType,
} from "#types/invoice";

import {
  formatAmount,
  formatPaymentMethod,
  formatStripeAmount,
  formatStripeDate,
} from "#utils/format";
import dayjs from "dayjs";
import { StockReservationStatus } from "#types/checkout";

export class CheckoutService implements ICheckoutService {
  private userRepository: UserRepository;
  private cartRepository: CartRepository;
  private cartItemRepository: CartItemRepository;
  private orderRepository: OrderRepository;
  private paymentGatewayProvider: StripePaymentGatewayProvider;
  private mailProvider: IMailProvider;

  constructor(dependencies: Dependencies) {
    Object.assign(this, dependencies);
  }

  async prepareCheckout(userId: string): Promise<Cart> {
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

      const { id: cartId } = cart;

      const cartItems = await queryRuner.manager.find(CartItem, {
        where: { cartId },
        relations: { product: true },
      });

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

  async createStripepayment(
    { currency, customer }: { currency: string; customer: string },
    cartItems: CartItem[],
  ) {
    const invoice = await this.paymentGatewayProvider.createInvoice({
      currency,
      customer,
    });

    await Promise.all(
      cartItems.map(({ quantity, product: { price, name, id: productId } }) =>
        this.paymentGatewayProvider.createInvoiceItem({
          invoice: invoice.id,
          description: name,
          customer,
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

  async createLocalInvoice(
    userId: string,
    cart: Cart,
    paymentInvoice: Response<Invoice>,
  ) {
    const { lines, currency, total, id: invoiceId } = paymentInvoice;
    const itemMap: Record<string, InvoiceLineItem> = {};

    const { id: cartId, items } = cart;

    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      for (const line of lines.data) {
        const { product } = line.pricing?.price_details || {};
        if (product) {
          itemMap[product] = line;
        }
      }

      const invoice = queryRunner.manager.create(InvoiceEntity, {
        cartId,
        currency,
        status: InvoiceStatus.OPEN,
        totalAmount: total,
        userId,
        id: invoiceId,
      });

      for (const item of items) {
        const line = itemMap[item.product.id];
        const total = parseFloat((line?.subtotal || 0).toString());

        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          invoiceId: invoice.id,
          name: item.product.name,
          productId: item.product.id,
          quantity: item.quantity,
          total,
          unitPrice: total / item.quantity,
          id: line?.id,
        });

        await queryRunner.manager.save(invoiceItem);
      }

      await queryRunner.manager.save(invoice);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log("error: ", error);
      throw new UnexpectedError("Failed to create local invoice");
    } finally {
      await queryRunner.release();
    }
  }

  async createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    user: User,
  ): Promise<Response<Invoice>> {
    const cart = await this.prepareCheckout(user.id);

    const { currency } = payload;

    const invoice = await this.createStripepayment(
      { currency, customer: user.stripeId! },
      cart.items,
    );

    await this.createLocalInvoice(user.id, cart, invoice);

    return invoice;
  }

  async checkout(stripeId: string, invoiceId: string): Promise<boolean> {
    const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId);

    const { payments } = invoice;

    const { id: invoicePaymentId } = payments?.data[0] || {};

    if (!invoicePaymentId) {
      throw new NotFoundError("Invoice Payment not found");
    }

    const invoicePayment =
      await this.paymentGatewayProvider.getInvoicePayment(invoicePaymentId);

    const { payment, status_transitions } = invoicePayment || {};

    const {
      latest_charge,
      payment_method,
      id: paymentIntentId,
    } = payment.payment_intent || {};

    if (!latest_charge) {
      throw new UnexpectedError("Missing latest charge");
    }

    const { receipt_url } = latest_charge;

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

    // Start transaction
    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const cart = await queryRunner.manager
        .createQueryBuilder(Cart, "cart")
        .setLock("pessimistic_write")
        .where("cart.user_id = :userId", { userId: user.id })
        .getOne();

      if (!cart || cart.status !== "active") {
        return false;
      }

      const reservations = await queryRunner.manager
        .createQueryBuilder(StockReservation, "sr")
        .setLock("pessimistic_write")
        .where("sr.cart_id = :cartId", { cartId: cart.id })
        .andWhere("sr.status = 'reserved'")
        .getMany();

      const productIds = reservations.map((r) => r.productId);

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
      await queryRunner.manager.save(cart);

      const invoiceItems = await queryRunner.manager.find(InvoiceItem, {
        where: { invoiceId },
      });

      const totalAmount = invoiceItems.reduce((prev, item) => {
        return prev + item.total;
      }, 0);

      // Create order
      const order = await this.orderRepository.createOrder(
        queryRunner,
        userId,
        {
          status: "paid",
          totalAmount,
          invoiceId,
        },
      );

      const orderItems = await Promise.all(
        invoiceItems.map(async ({ unitPrice, quantity, productId }) => {
          // Create order item
          return queryRunner.manager.create(OrderItem, {
            order,
            priceAtPurchase: unitPrice,
            product: { id: productId },
            quantity,
          });
        }),
      );

      await queryRunner.manager.update(InvoiceEntity, invoiceId, {
        status: InvoiceStatus.PAID,
        paidAt: new Date((status_transitions.paid_at || Date.now()) * 1000),
        paymentIntentId,
      });

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
          items: invoiceItems.map(({ unitPrice, quantity, total, name }) => ({
            quantity,
            unit_price: formatStripeAmount(unitPrice, currency),
            total: formatStripeAmount(total, currency),
            name,
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

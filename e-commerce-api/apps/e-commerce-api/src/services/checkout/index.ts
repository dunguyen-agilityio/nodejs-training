import { FastifyBaseLogger } from 'fastify'
import { QueryRunner } from 'typeorm'

import env from '#env'

import type { TOrderRepository, TUserRepository } from '#repositories'

import {
  formatAmount,
  formatPaymentMethod,
  formatStripeAmount,
  formatStripeDate,
} from '#utils/format'
import { formatInvoiceItems } from '#utils/invoice'

import {
  EmailProvider,
  Invoice,
  MailTemplate,
  NotFoundError,
  PaymentGateway,
  PaymentIntent,
  PaymentMethod,
  TResponse,
  UnexpectedError,
} from '#types'

import { Cart, CartItem, Order, OrderItem, OrderStatus, User } from '#entities'

import { IInventoryService } from '../inventory/type'
import { ICheckoutService } from './type'

export type InvoiceItemData = {
  productName: string
  unitPrice: number
  quantity: number
  productId: string
  total: number
}

export class CheckoutService implements ICheckoutService {
  constructor(
    private userRepository: TUserRepository,
    private orderRepository: TOrderRepository,
    private inventoryService: IInventoryService,
    private paymentGatewayProvider: PaymentGateway,
    private mailProvider: EmailProvider,
    private logger: FastifyBaseLogger,
  ) {}

  async processPayment(
    { currency }: { currency: string },
    userStripeId: string,
  ): Promise<{ orderId: number; clientSecret: string }> {
    const user = await this.userRepository.getByStripeId(userStripeId)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const { id: userId } = user

    const hasPendingOrder = await this.orderRepository.hasPendingOrder(userId)

    if (hasPendingOrder) {
      throw new UnexpectedError(
        'You have a pending order. Please complete it before placing a new order.',
      )
    }

    this.logger.debug(
      { userId, userStripeId, currency },
      'Generating payment intent',
    )

    const queryRunner = this.createQueryRunner()
    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      this.logger.debug(
        { userId, userStripeId, currency },
        'Transaction started for payment intent generation',
      )

      const { cart } = await this.locking(queryRunner, userId)
      const { id: cartId } = cart

      const items = cart.items.map((item) => ({
        description: item.product.name,
        customer: userStripeId,
        quantity: item.quantity,
        price_data: {
          currency,
          product: item.productId.toString(),
          unit_amount: Math.round(item.product.price * 100),
        },
      }))

      this.logger.info(
        { currency, userStripeId, items },
        'Processing payment intent',
      )

      const invoice = await this.paymentGatewayProvider.processPayment({
        currency,
        customer: userStripeId,
        items,
      })

      await this.inventoryService.reserveStock(
        queryRunner,
        cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        invoice.id,
        cartId,
      )

      await queryRunner.manager.delete(CartItem, { cartId: cartId })

      const { client_secret } = invoice.confirmation_secret || {}
      const order = await this.createOrder(queryRunner, userId, invoice)

      await this.sendInvoice(user, invoice, order, currency)

      this.logger.info(
        { userId, invoiceId: invoice.id },
        'Payment intent generated successfully',
      )
      await queryRunner.commitTransaction()

      return {
        orderId: order.id,
        clientSecret: client_secret || '',
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new UnexpectedError(
        'Failed to generate payment intent' +
          (error instanceof Error ? error.message : String(error)),
      )
    } finally {
      await queryRunner.release()
    }
  }

  async sendInvoice(
    user: User,
    invoice: TResponse<Invoice>,
    order: Order,
    currency: string,
  ) {
    const { email, name } = user
    const { client_secret } = invoice.confirmation_secret || {}

    await this.mailProvider.send({
      from: env.mail.fromEmail,
      to: email,
      templateName: MailTemplate.PAYMENT,
      subject: `[${env.app.name}] - Invoice - #${invoice.number}`,
      dynamicTemplateData: {
        company_name: env.app.name,
        invoice_id: invoice.number!,
        customer_name: name,
        amount_due: formatAmount(
          invoice.amount_due / 100,
          currency.toUpperCase(),
        ),
        due_date: formatStripeDate(invoice.created),
        invoice_url: client_secret
          ? `${env.client.baseUrl}/checkout?clientSecret=${client_secret}&orderId=${order.id}`
          : invoice.hosted_invoice_url!,
        support_email: env.mail.supportEmail,
        help_center_url: 'https://moderncloud.com/help',
        subject: `Invoice ${invoice.number} for ${name}`,
      },
    })

    return order
  }

  async locking(queryRunner: QueryRunner, userId: string) {
    const cart = await queryRunner.manager
      .createQueryBuilder(Cart, 'cart')
      .setLock('pessimistic_write')
      .where('cart.user_id = :userId', { userId })
      .getOne()

    if (!cart || cart.status !== 'active') {
      throw new UnexpectedError('Cart not active or not found')
    }

    const { id: cartId } = cart

    const cartItems = await queryRunner.manager
      .createQueryBuilder(CartItem, 'cartItem')
      .where('cartItem.cart_id = :cartId', { cartId })
      .leftJoinAndSelect('cartItem.product', 'product')
      .getMany()

    await this.inventoryService.checkAvailability(
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    )

    cart.items = cartItems

    return { cart }
  }

  /**
   * @description Handles the post-payment logic after a successful Stripe webhook event.
   * This method finalizes the order by updating stock, creating an order in the database,
   * clearing the cart, and sending a confirmation email. It operates within a transaction.
   */
  async handleSuccessfulPayment(
    stripeId: string,
    invoiceId: string,
  ): Promise<void> {
    this.logger.debug({ stripeId, invoiceId }, 'Handling successful payment')
    const queryRunner = this.createQueryRunner()
    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const user = await this.userRepository.getByStripeId(stripeId)

      if (!user) {
        throw new NotFoundError('User not found')
      }

      const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId)

      if (
        !invoice ||
        invoice.status !== 'paid' ||
        !invoice.payments?.data[0]?.payment?.payment_intent
      ) {
        throw new UnexpectedError('Invoice not paid or not found')
      }

      const { payment_intent } = invoice.payments.data[0].payment

      const paymentIntent = await this.paymentGatewayProvider.getPaymentIntent(
        typeof payment_intent === 'string' ? payment_intent : payment_intent.id,
      )

      await this.inventoryService.commitStock(queryRunner, invoiceId)

      const order = await this.updateOrderStatus(queryRunner, invoiceId, 'paid')

      await queryRunner.commitTransaction()

      this.logger.info(
        { userId: user.id, invoiceId, orderId: order.id },
        'Payment handled successfully',
      )

      await this.sendConfirmationEmail(invoice, user, paymentIntent)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async sendConfirmationEmail(
    invoice: Invoice,
    user: User,
    paymentIntent: PaymentIntent,
  ) {
    const items = formatInvoiceItems(invoice)
    const {
      currency,
      total,
      number: invoice_number,
      receipt_number,
      invoice_pdf,
      status_transitions,
    } = invoice
    const { email: customer_email, name: customer_name } = user
    const payment_method = paymentIntent.payment_method ?? ({} as PaymentMethod)
    const { receipt_url } = paymentIntent.latest_charge ?? {}
    const formattedPaymenMethod = formatPaymentMethod(payment_method)

    this.logger.debug(
      { customer_email, invoice_number },
      'Sending confirmation email',
    )

    await this.mailProvider.send({
      from: env.mail.fromEmail,
      to: customer_email,
      templateName: MailTemplate.INVOICE,
      subject: `Payment receipt from ${env.app.name} #${receipt_number}`,
      dynamicTemplateData: {
        name: customer_name,
        email: customer_email,
        company_name: env.app.name,
        support_email: env.mail.supportEmail,
        amount_paid: formatStripeAmount(total, currency),
        paid_date: formatStripeDate(status_transitions.paid_at || Date.now()),
        receipt_number: receipt_number!,
        invoice_number: invoice_number!,
        payment_method: formattedPaymenMethod,
        invoice_url: invoice_pdf!,
        receipt_url: receipt_url,
        items: items.map(({ unitPrice, quantity, productName }) => ({
          quantity,
          unit_price: formatAmount(unitPrice, currency),
          total: formatAmount(unitPrice * quantity, currency),
          name: productName,
        })),
      },
    })
    this.logger.info(
      { customer_email, invoice_number },
      'Confirmation email sent successfully',
    )
  }

  private createQueryRunner() {
    return this.orderRepository.manager.connection.createQueryRunner()
  }

  private updateOrderStatus = async (
    queryRunner: QueryRunner,
    invoiceId: string,
    status: OrderStatus,
  ) => {
    const order = await queryRunner.manager.findOneBy(Order, {
      invoiceId,
    })
    if (!order) {
      throw new NotFoundError('Order not found')
    }
    order.status = status
    await queryRunner.manager.save(order)
    this.logger.info({ orderId: order.id }, 'Order status updated successfully')
    return order
  }

  /**
   * @description Create an order and its associated order items in the database after a successful payment.
   */
  private async createOrder(
    queryRunner: QueryRunner,
    userId: string,
    invoice: TResponse<Invoice>,
    status: OrderStatus = 'pending',
  ) {
    const items = formatInvoiceItems(invoice)
    const totalAmount = items.reduce((prev, item) => prev + item.total, 0)

    let order = await this.orderRepository.findOne({
      where: { invoiceId: invoice.id },
    })

    if (!order) {
      order = await queryRunner.manager.save(
        queryRunner.manager.create(Order, {
          status,
          totalAmount,
          invoiceId: invoice.id,
          user: { id: userId },
          paymentSecret: invoice.confirmation_secret?.client_secret ?? '',
        }),
      )
    }

    const orderItems = items.map(({ unitPrice, quantity, productId }) => {
      return queryRunner.manager.create(OrderItem, {
        order,
        priceAtPurchase: unitPrice,
        product: { id: productId },
        quantity,
      })
    })

    await queryRunner.manager.save(orderItems)

    return order
  }
}

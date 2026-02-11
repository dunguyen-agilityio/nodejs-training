import { FastifyBaseLogger } from 'fastify'
import { QueryRunner } from 'typeorm'

import dayjs from 'dayjs'

import env from '#env'

import type { TOrderRepository, TUserRepository } from '#repositories'

import {
  formatAmount,
  formatPaymentMethod,
  formatStripeAmount,
  formatStripeDate,
} from '#utils/format'

import {
  BadRequestError,
  EmailProvider,
  Invoice,
  MailTemplate,
  NotFoundError,
  PaymentGateway,
  PaymentMethod,
  StockReservationStatus,
  TResponse,
  UnexpectedError,
} from '#types'

import {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  StockReservation,
} from '#entities'

import { ConfirmationEmailPayload, ICheckoutService } from './type'

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
    private paymentGatewayProvider: PaymentGateway,
    private mailProvider: EmailProvider,
    private logger: FastifyBaseLogger,
  ) {}

  async processPayment(
    payload: { currency: string },
    userStripeId: string,
  ): Promise<{ orderId: number; clientSecret: string }> {
    const { currency } = payload
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
      { userId, userStripeId, currency: payload.currency },
      'Generating payment intent',
    )

    const queryRunner = this.createQueryRunner()
    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      this.logger.debug(
        { userId, userStripeId, currency: payload.currency },
        'Transaction started for payment intent generation',
      )

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

      this.validateCartItems(cartItems)

      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .setLock('pessimistic_write')
        .where('product.id IN (:...ids)', {
          ids: cartItems.map((i) => i.productId),
        })
        .getMany()

      const items = cartItems.map((item) => ({
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

      await this.createReserveStock(
        queryRunner,
        cartId,
        formatCartItems(cartItems, currency),
        invoice.id,
        products,
      )

      await queryRunner.manager.delete(CartItem, { cartId: cartId })

      const { email, name } = user

      const { client_secret } = invoice.confirmation_secret || {}

      const order = await this.createOrder(queryRunner, userId, invoice)

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
      this.logger.debug(
        { stripeId, invoiceId },
        'Transaction started for payment handling',
      )

      const user = await this.userRepository.getByStripeId(stripeId)
      if (!user) {
        throw new NotFoundError('User not found')
      }

      this.logger.debug(
        { userId: user.id, stripeId },
        'User found for payment processing',
      )

      const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId)
      if (!invoice || invoice.status !== 'paid') {
        throw new UnexpectedError('Invoice not paid or not found')
      }

      const { payment_intent } = invoice.payments?.data[0]?.payment ?? {}

      const payment_intentID =
        typeof payment_intent === 'string' ? payment_intent : payment_intent?.id

      const paymentIntent = await this.paymentGatewayProvider.getPaymentIntent(
        payment_intentID ?? '',
      )
      const items = formatInvoiceItems(invoice)

      await this._updateStockAndReservations(queryRunner, invoiceId)

      const order = await this.updateOrderStatus(queryRunner, invoiceId, 'paid')

      await queryRunner.commitTransaction()
      this.logger.info(
        { userId: user.id, invoiceId, orderId: order.id },
        'Payment handled successfully',
      )

      const {
        currency,
        total,
        number: invoice_number,
        receipt_number,
        invoice_pdf,
      } = invoice
      const { email, name } = user
      const payment_method =
        paymentIntent.payment_method ?? ({} as PaymentMethod)
      const { receipt_url } = paymentIntent.latest_charge ?? {}
      const formattedPaymenMethod = formatPaymentMethod(payment_method)

      await this.sendConfirmationEmail(items, {
        currency,
        customer_email: email,
        customer_name: name,
        invoice_url: invoice_pdf!,
        invoice_number: invoice_number!,
        paid_at: invoice.status_transitions.paid_at!,
        payment_method: formattedPaymenMethod,
        receipt_number: receipt_number!,
        receipt_url,
        total,
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private createQueryRunner() {
    return this.orderRepository.manager.connection.createQueryRunner()
  }

  /**
   * @description Reserves stock for products in the cart. This is a private helper method for `prepareCheckout`.
   * It checks for available stock and creates stock reservations.
   */
  private async createReserveStock(
    queryRunner: QueryRunner,
    cartId: number,
    cartItems: InvoiceItemData[],
    invoiceId: string,
    products: Product[],
  ) {
    this.logger.debug(
      { cartId, itemCount: cartItems.length },
      'Reserving stock for cart items',
    )

    const quantityMap: Record<string, number> = {}

    for (const item of cartItems) {
      const productId = item.productId
      quantityMap[productId] = (quantityMap[productId] ?? 0) + item.quantity
    }

    const reservations: StockReservation[] = []

    for (const product of products) {
      const need = quantityMap[product.id]!
      const available = product.stock - product.reservedStock

      if (available < need) {
        throw new BadRequestError('Insufficient stock for reservation')
      }

      product.reservedStock += need

      const reservation = queryRunner.manager.create(StockReservation, {
        cartId,
        productId: product.id,
        quantity: need,
        status: StockReservationStatus.RESERVED,
        expiresAt: dayjs().add(15, 'minute').toDate(),
        invoiceId,
      })

      reservations.push(reservation)
    }

    await queryRunner.manager.save(products)
    await queryRunner.manager.save(reservations)
    this.logger.info({ cartId }, 'Stock reserved successfully')
  }

  /**
   * @description Releases expired stock reservations.
   * This method finds all reservations that have expired and are still in 'reserved' status.
   * It then updates the product stock and marks the reservation as 'released'.
   */
  async releaseExpiredStockReservations() {
    const queryRunner = this.createQueryRunner()
    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const expiredReservations = await queryRunner.manager
        .createQueryBuilder(StockReservation, 'sr')
        .setLock('pessimistic_write')
        .where('sr.status = :status', {
          status: StockReservationStatus.RESERVED,
        })
        .andWhere('sr.expires_at <= :now', { now: new Date() })
        .getMany()

      if (expiredReservations.length === 0) {
        await queryRunner.commitTransaction()
        return
      }

      this.logger.info(
        { count: expiredReservations.length },
        'Found expired reservations to release',
      )

      const productIds = [
        ...new Set(expiredReservations.map((r) => r.productId)),
      ]

      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .setLock('pessimistic_write')
        .where('product.id IN (:...ids)', { ids: productIds })
        .getMany()

      const productMap: Record<string, Product> = {}
      for (const p of products) {
        productMap[p.id] = p
      }

      for (const reservation of expiredReservations) {
        const product = productMap[reservation.productId]
        if (product) {
          product.reservedStock -= reservation.quantity
          // Ensure reservedStock doesn't go below 0 (sanity check)
          if (product.reservedStock < 0) product.reservedStock = 0
        }
        reservation.status = StockReservationStatus.RELEASED
      }

      await queryRunner.manager.save(products)
      await queryRunner.manager.save(expiredReservations)

      await queryRunner.commitTransaction()
      this.logger.info(
        { count: expiredReservations.length },
        'Released expired stock reservations',
      )
    } catch (error) {
      this.logger.error(
        { error },
        'Failed to release expired stock reservations',
      )
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  validateCartItems = (cartItems: CartItem[]) => {
    if (cartItems.length === 0) {
      throw new UnexpectedError('Cart is empty')
    }

    let error = ''

    cartItems.some((item) => {
      if (item.product.status !== 'published') {
        error = `Product ${item.product.name} is not available`
        return true
      }

      const availableStock = item.product.stock - item.product.reservedStock
      this.logger.info({ availableStock }, 'availableStock')

      if (item.quantity > availableStock) {
        error = `Product ${item.product.name} is out of stock`
        return true
      }

      return false
    })

    if (error) {
      throw new UnexpectedError(error)
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + Math.round(item.product.price * item.quantity),
      0,
    )

    if (totalAmount < 1) {
      throw new UnexpectedError('Total amount is less than 1')
    }
  }

  /**
   * @description Update product stock and convert stock reservations to a 'converted' status after a successful order.
   */
  private async _updateStockAndReservations(
    queryRunner: QueryRunner,
    invoiceId: string,
  ) {
    this.logger.debug({ invoiceId }, 'Updating stock and reservations')
    const reservations = await queryRunner.manager
      .createQueryBuilder(StockReservation, 'sr')
      .setLock('pessimistic_write')
      .where('sr.invoice_id = :invoiceId', { invoiceId })
      .andWhere("sr.status = 'reserved'")
      .getMany()

    const productIds = reservations.map((r: StockReservation) => r.productId)

    if (productIds.length < 1) return

    const products = await queryRunner.manager
      .createQueryBuilder(Product, 'product')
      .setLock('pessimistic_write')
      .where('product.id IN (:...ids)', { ids: productIds })
      .getMany()

    const productMap: Record<string, Product> = {}
    for (const p of products) {
      productMap[p.id] = p
    }
    for (const r of reservations) {
      const product = productMap[r.productId]!
      product.stock -= r.quantity
      product.reservedStock -= r.quantity
      r.status = StockReservationStatus.CONVERTED
    }
    await queryRunner.manager.save(products)
    await queryRunner.manager.save(reservations)
    this.logger.info(
      {
        invoiceId,
        productCount: products.length,
        reservationCount: reservations.length,
      },
      'Stock and reservations updated successfully',
    )
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

  private async sendConfirmationEmail(
    invoiceItems: InvoiceItemData[],
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
    }: ConfirmationEmailPayload,
  ) {
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
        paid_date: formatStripeDate(paid_at || Date.now()),
        receipt_number,
        invoice_number,
        payment_method,
        invoice_url,
        receipt_url: receipt_url,
        items: invoiceItems.map(({ unitPrice, quantity, productName }) => ({
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
}

const formatInvoiceItems = (invoice: Invoice): InvoiceItemData[] => {
  const items = invoice.lines.data.map((item) => ({
    productName: item.description ?? '',
    unitPrice: parseFloat(item.pricing?.unit_amount_decimal || '0') / 100,
    quantity: item.quantity ?? 0,
    currency: item.currency,
    total: item.amount,
    productId: item.pricing?.price_details?.product ?? '',
  }))

  return items
}

const formatCartItems = (
  items: CartItem[],
  currency: string,
): InvoiceItemData[] => {
  return items.map(({ product, quantity }) => ({
    productName: product.name,
    unitPrice: product.price,
    quantity: quantity ?? 0,
    currency: currency,
    total: product.price * quantity,
    productId: product.id,
  }))
}

import { FastifyBaseLogger } from 'fastify'
import { QueryRunner } from 'typeorm'

import dayjs from 'dayjs'

import env from '#env'

import type {
  TCartRepository,
  TOrderRepository,
  TUserRepository,
} from '#repositories'

import {
  formatPaymentMethod,
  formatStripeAmount,
  formatStripeDate,
} from '#utils/format'

import {
  BadRequestError,
  EmailProvider,
  Invoice,
  NotFoundError,
  PaymentGateway,
  PaymentMethod,
  StockReservationStatus,
  TResponse,
  UnexpectedError,
} from '#types'

import { Cart, CartItem, OrderItem, Product, StockReservation } from '#entities'

import { ConfirmationEmailPayload, ICheckoutService } from './type'

export type InvoiceItemData = {
  productName: string
  unitPrice: number
  quantity: number
  productId: string
}

export class CheckoutService implements ICheckoutService {
  constructor(
    private userRepository: TUserRepository,
    private orderRepository: TOrderRepository,
    private paymentGatewayProvider: PaymentGateway,
    private mailProvider: EmailProvider,
    private logger: FastifyBaseLogger,
  ) {}

  /**
   * @description Generates a Stripe Payment Intent for preview purposes.
   * This involves preparing the checkout (reserving stock) and creating a Stripe invoice.
   */
  async generatePaymentIntent(
    payload: { currency: string },
    userId: string,
    userStripeId: string,
  ): Promise<TResponse<Invoice>> {
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
      const cart = await this._getCart(queryRunner, userId)

      if (!cart) {
        throw new NotFoundError('Cart not found')
      }

      this._validateCart(cart.items)

      const { currency } = payload

      const invoice = await this.paymentGatewayProvider.createInvoice({
        currency,
        customer: userStripeId,
      })

      this.logger.debug({ invoiceId: invoice.id }, 'Invoice created')

      await Promise.all(
        cart.items.map(
          ({ quantity, product: { price, name, id: productId } }) =>
            this.paymentGatewayProvider.createInvoiceItem({
              invoice: invoice.id,
              description: name,
              customer: userStripeId,
              quantity,
              price_data: {
                currency,
                product: productId.toString(),
                unit_amount: Math.round(price * 100),
              },
            }),
        ),
      )

      this.logger.debug({ invoiceId: invoice.id }, 'Invoice items created')

      const finalizeInvoice = await this.paymentGatewayProvider.finalizeInvoice(
        invoice.id,
      )

      this.logger.info(
        { userId, invoiceId: invoice.id },
        'Payment intent generated successfully',
      )
      await queryRunner.commitTransaction()
      return finalizeInvoice
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * @description Prepares the order for payment by preparing the checkout (reserving stock)
   * and creating a local invoice based on an existing opened Stripe invoice.
   */
  async prepareOrderForPayment(
    userId: string,
    stripeId: string,
  ): Promise<Invoice> {
    this.logger.debug({ userId, stripeId }, 'Preparing order for payment')
    await this._prepareCheckout(userId)

    const invoice =
      await this.paymentGatewayProvider.getOpenedInvoiceByUser(stripeId)

    this.logger.info(
      { userId, invoiceId: invoice.id },
      'Order prepared for payment successfully',
    )
    return invoice
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

      const cart = await this._getCart(queryRunner, user.id)

      await this._updateStockAndReservations(queryRunner, cart.id)
      await this._createOrder(queryRunner, user.id, invoice)
      await queryRunner.manager.delete(CartItem, { cartId: cart.id })

      await queryRunner.commitTransaction()
      this.logger.info(
        { userId: user.id, invoiceId, cartId: cart.id },
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

      await this._sendConfirmationEmail(items, {
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
   * @description Prepares the user's cart for checkout by reserving stock for each item.
   * This method initiates a database transaction to ensure atomicity.
   */
  private async _prepareCheckout(userId: string): Promise<Cart> {
    this.logger.debug({ userId }, 'Preparing checkout for user')
    const queryRuner = this.createQueryRunner()

    try {
      await queryRuner.connect()
      await queryRuner.startTransaction()
      this.logger.debug(
        { userId },
        'Transaction started for checkout preparation',
      )

      const cart = await this._getCart(queryRuner, userId)

      const { items: cartItems } = cart

      this._validateCart(cartItems)

      await this._reserveStock(queryRuner, cart.id, cartItems)

      await queryRuner.commitTransaction()
      this.logger.info(
        { userId, cartId: cart.id, itemCount: cartItems.length },
        'Checkout prepared successfully',
      )
      return { ...cart, items: cartItems }
    } catch (error) {
      let errorMessage = 'Failed to prepare Checkout'
      if (error instanceof UnexpectedError) {
        errorMessage = error.message
      }

      await queryRuner.rollbackTransaction()
      throw new UnexpectedError(errorMessage)
    } finally {
      await queryRuner.release()
    }
  }

  /**
   * @description Reserves stock for products in the cart. This is a private helper method for `prepareCheckout`.
   * It checks for available stock and creates stock reservations.
   */
  private async _reserveStock(
    queryRuner: QueryRunner,
    cartId: number,
    cartItems: CartItem[],
  ) {
    this.logger.debug(
      { cartId, itemCount: cartItems.length },
      'Reserving stock for cart items',
    )
    const productIds = cartItems.map((i) => i.product.id)

    const products = await queryRuner.manager
      .createQueryBuilder(Product, 'product')
      .setLock('pessimistic_write')
      .where('product.id IN (:...ids)', { ids: productIds })
      .getMany()

    const quantityMap: Record<string, number> = {}

    for (const item of cartItems) {
      const productId = item.product.id
      quantityMap[productId] = (quantityMap[productId] ?? 0) + item.quantity
    }

    for (const product of products) {
      const need = quantityMap[product.id]!
      const available = product.stock - product.reservedStock

      if (available < need) {
        throw new BadRequestError('Insufficient stock for reservation')
      }

      product.reservedStock += need

      const reservation = queryRuner.manager.create(StockReservation, {
        cartId,
        productId: product.id,
        quantity: need,
        status: StockReservationStatus.RESERVED,
        expiresAt: dayjs().add(15, 'minute').toDate(),
      })

      await queryRuner.manager.save(reservation)
    }

    await queryRuner.manager.save(products)
    this.logger.info(
      { cartId, productCount: products.length },
      'Stock reserved successfully',
    )
  }

  /**
   * @description Retrieve an active cart for a user within a transaction.
   */
  private async _getCart(
    queryRunner: QueryRunner,
    userId: string,
  ): Promise<Cart> {
    this.logger.debug({ userId }, 'Fetching cart for payment processing')

    const cart = await queryRunner.manager
      .createQueryBuilder(Cart, 'cart')
      .setLock('pessimistic_write')
      .where('cart.user_id = :userId', { userId })
      .getOne()

    if (!cart || cart.status !== 'active') {
      throw new UnexpectedError('Cart not active or not found')
    }

    this.logger.debug({ userId, cartId: cart.id }, 'Cart fetched successfully')

    const cartItems = await queryRunner.manager
      .createQueryBuilder(CartItem, 'cartItem')
      .where('cartItem.cart_id = :cartId', { cartId: cart.id })
      .leftJoinAndSelect('cartItem.product', 'product')
      .getMany()

    this._validateCart(cartItems)

    return { ...cart, items: cartItems }
  }

  /**
   * @description Validate cart items availability and stock.
   */
  private _validateCart(cartItems: CartItem[]) {
    let error = ''

    cartItems.some((item) => {
      if (item.product.status !== 'published') {
        error = `Product ${item.product.name} is not available`
        return true
      }

      if (item.quantity > item.product.stock) {
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
    cartId: number,
  ) {
    this.logger.debug({ cartId }, 'Updating stock and reservations')
    const reservations = await queryRunner.manager
      .createQueryBuilder(StockReservation, 'sr')
      .setLock('pessimistic_write')
      .where('sr.cart_id = :cartId', { cartId })
      .andWhere("sr.status = 'reserved'")
      .getMany()

    const productIds = reservations.map((r: StockReservation) => r.productId)

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
        cartId,
        productCount: products.length,
        reservationCount: reservations.length,
      },
      'Stock and reservations updated successfully',
    )
  }

  /**
   * @description Create an order and its associated order items in the database after a successful payment.
   */
  private async _createOrder(
    queryRunner: QueryRunner,
    userId: string,
    invoice: TResponse<Invoice>,
  ) {
    const items = formatInvoiceItems(invoice)
    this.logger.debug(
      { userId, invoiceId: invoice.id, itemCount: items.length },
      'Creating order',
    )
    const totalAmount = items.reduce((prev, item) => prev + item.total, 0)

    const order = await this.orderRepository.createOrder(queryRunner, userId, {
      status: 'processing',
      totalAmount,
      invoiceId: invoice.id,
    })

    const orderItems = await Promise.all(
      items.map(async ({ unitPrice, quantity, productId }) => {
        return queryRunner.manager.create(OrderItem, {
          order,
          priceAtPurchase: unitPrice,
          product: { id: productId },
          quantity,
        })
      }),
    )

    await queryRunner.manager.save(orderItems)
    this.logger.info(
      { userId, invoiceId: invoice.id, itemCount: items.length },
      'Order created successfully',
    )
    return order
  }

  private async _sendConfirmationEmail(
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
    const message = {
      from: env.sendgrid.fromEmail,
      templateId: env.sendgrid.templates.orderSuccess,
      to: customer_email,
      dynamicTemplateData: {
        name: customer_name,
        email: customer_email,
        company_name: env.app.name,
        support_email: env.sendgrid.supportEmail,
        amount_paid: formatStripeAmount(total, currency),
        paid_date: formatStripeDate(paid_at || Date.now()),
        receipt_number,
        invoice_number,
        payment_method,
        invoice_url,
        receipt_url: receipt_url,
        items: invoiceItems.map(({ unitPrice, quantity, productName }) => ({
          quantity,
          unit_price: formatStripeAmount(unitPrice, currency),
          total: formatStripeAmount(unitPrice * quantity, currency),
          name: productName,
        })),
      },
    }

    await this.mailProvider.sendWithTemplate(message)
    this.logger.info(
      { customer_email, invoice_number },
      'Confirmation email sent successfully',
    )
  }
}

const formatInvoiceItems = (invoice: Invoice) => {
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

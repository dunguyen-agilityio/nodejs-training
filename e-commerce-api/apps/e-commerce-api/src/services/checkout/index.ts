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
  EmailProvider,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  NotFoundError,
  PaymentDetails,
  PaymentGateway,
  PaymentMethodType,
  StockReservationStatus,
  TResponse,
  UnexpectedError,
} from '#types'

import { CartItemDto } from '#dtos/cart-item'

import {
  Cart,
  CartItem,
  Invoice as InvoiceEntity,
  InvoiceItem,
  OrderItem,
  Product,
  StockReservation,
} from '#entities'

import { ConfirmationEmailPayload, ICheckoutService } from './type'

export class CheckoutService implements ICheckoutService {
  constructor(
    private userRepository: TUserRepository,
    private cartRepository: TCartRepository,
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
  ): Promise<TResponse<Invoice & { items: CartItem[] }>> {
    this.logger.info(
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
        this.logger.error({ userId }, 'Cart not found for payment intent')
        throw new NotFoundError('Cart not found')
      }

      this._validateCart(cart.items, userId)

      const { currency } = payload

      const invoice = await this.paymentGatewayProvider.createInvoice({
        currency,
        customer: userStripeId,
      })

      this.logger.info({ invoiceId: invoice.id }, 'Invoice created')

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

      this.logger.info({ invoiceId: invoice.id }, 'Invoice items created')

      const finalizeInvoice = await this.paymentGatewayProvider.finalizeInvoice(
        invoice.id,
      )

      this.logger.info(
        { userId, invoiceId: invoice.id },
        'Payment intent generated successfully',
      )
      await queryRunner.commitTransaction()
      return {
        ...finalizeInvoice,
        items: cart.items.map((item) => new CartItemDto(item)),
      }
    } catch (error) {
      this.logger.error({ error }, 'Error generating payment intent')
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
    this.logger.info({ userId, stripeId }, 'Preparing order for payment')
    const cart = await this._prepareCheckout(userId)

    const invoice =
      await this.paymentGatewayProvider.getOpenedInvoiceByUser(stripeId)

    await this._createLocalInvoice(userId, cart, invoice)

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
    this.logger.info({ stripeId, invoiceId }, 'Handling successful payment')
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
        this.logger.error({ stripeId }, 'User not found for successful payment')
        throw new NotFoundError('User not found')
      }

      this.logger.debug(
        { userId: user.id, stripeId },
        'User found for payment processing',
      )

      const invoice = await this.paymentGatewayProvider.getInvoice(invoiceId)
      if (!invoice || invoice.status !== 'paid') {
        this.logger.error(
          { invoiceId, status: invoice?.status },
          'Invoice not paid or not found',
        )
        throw new UnexpectedError('Invoice not paid or not found')
      }

      const cart = await this._getCart(queryRunner, user.id)

      const { paymentDetails, invoiceItems } =
        await this._getPaymentDetailsAndItems(invoiceId, invoice)

      await this._updateStockAndReservations(queryRunner, cart.id)
      await this._createOrder(queryRunner, user.id, invoice, invoiceItems)
      await this._updateLocalInvoice(queryRunner, invoice.id, paymentDetails)
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
      const { paid_at, payment_method, receipt_url } = paymentDetails

      const formattedPaymenMethod = formatPaymentMethod(
        payment_method.type as PaymentMethodType,
        payment_method,
      )

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
      })
    } catch (error) {
      this.logger.error(
        { stripeId, invoiceId, error },
        'Error handling successful payment',
      )
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

      this._validateCart(cartItems, userId)

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
      this.logger.error({ userId, error }, errorMessage)
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
        this.logger.error(
          { productId: product.id, productName: product.name, need, available },
          'Insufficient stock for reservation',
        )
        throw new Error('Out of stock')
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
   * @description Creates a local representation of the Stripe invoice in the application's database.
   * It initiates a database transaction to ensure atomicity.
   */
  private async _createLocalInvoice(
    userId: string,
    cart: Cart,
    paymentInvoice: Invoice,
  ) {
    this.logger.info(
      { userId, cartId: cart.id, invoiceId: paymentInvoice.id },
      'Creating local invoice',
    )
    const { id: cartId } = cart
    const { lines, currency, total, id: invoiceId } = paymentInvoice

    const queryRunner = this.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const invoice = queryRunner.manager.create(InvoiceEntity, {
        cartId,
        currency,
        status: InvoiceStatus.OPEN,
        totalAmount: total,
        userId,
        id: invoiceId,
      })

      await this._createInvoiceItems(queryRunner, invoice.id, lines.data)

      await queryRunner.manager.save(invoice)

      await queryRunner.commitTransaction()
      this.logger.info(
        { userId, invoiceId },
        'Local invoice created successfully',
      )
    } catch (error) {
      this.logger.error(
        { userId, invoiceId, error },
        'Error creating local invoice',
      )
      await queryRunner.rollbackTransaction()
      throw new UnexpectedError('Failed to create local invoice')
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * @description Create and save local invoice items within a transaction.
   */
  private async _createInvoiceItems(
    queryRunner: QueryRunner,
    invoiceId: string,
    invoiceLineItems: InvoiceLineItem[],
  ) {
    this.logger.debug(
      { invoiceId, itemCount: invoiceLineItems.length },
      'Creating invoice items',
    )
    try {
      for (const line of invoiceLineItems) {
        const { product } = line.pricing?.price_details || {}

        const total = line.subtotal

        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          invoiceId,
          product: { id: product! },
          quantity: line.quantity ?? 1,
          total,
          unitPrice: total / (line.quantity ?? 1),
          id: line.id,
        })

        await queryRunner.manager.save(invoiceItem)
      }

      this.logger.debug(
        { invoiceId, itemCount: invoiceLineItems.length },
        'Invoice items created successfully',
      )
    } catch (error) {
      this.logger.error({ invoiceId, error }, 'Error creating invoice items')
      throw new UnexpectedError('Failed to create local invoice items')
    }
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
      this.logger.debug(
        { userId, cartStatus: cart?.status },
        'Cart not active or not found',
      )
      throw new UnexpectedError('Cart not active or not found')
    }
    this.logger.debug({ userId, cartId: cart.id }, 'Cart fetched successfully')

    const cartItems = await queryRunner.manager
      .createQueryBuilder(CartItem, 'cartItem')
      .where('cartItem.cart_id = :cartId', { cartId: cart.id })
      .leftJoinAndSelect('cartItem.product', 'product')
      .getMany()

    this._validateCart(cartItems, userId)

    return { ...cart, items: cartItems }
  }

  /**
   * @description Validate cart items availability and stock.
   */
  private _validateCart(cartItems: CartItem[], userId: string) {
    const unavailableProduct = cartItems.find(
      (item) => item.product.status !== 'published',
    )

    if (unavailableProduct) {
      this.logger.error(
        {
          userId,
          productId: unavailableProduct.product.id,
          status: unavailableProduct.product.status,
        },
        'Unavailable product in cart',
      )
      throw new UnexpectedError(
        `Product ${unavailableProduct.product.name} is not available`,
      )
    }

    const outOfStockProduct = cartItems.find(
      (item) => item.quantity > item.product.stock,
    )

    if (outOfStockProduct) {
      this.logger.error(
        { userId, productId: outOfStockProduct.product.id },
        'Out of stock product in cart',
      )
      throw new UnexpectedError(
        `Product ${outOfStockProduct.product.name} is out of stock`,
      )
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + Math.round(item.product.price * item.quantity),
      0,
    )
    this.logger.info({ totalAmount }, 'Total amount calculated')

    if (totalAmount < 1) {
      throw new UnexpectedError('Total amount is less than 1')
    }
  }

  /**
   * @description Fetch payment details and local invoice items from Stripe.
   */
  private async _getPaymentDetailsAndItems(
    invoiceId: string,
    invoice: TResponse<Invoice>,
  ): Promise<{
    paymentDetails: PaymentDetails
    invoiceItems: InvoiceItem[]
  }> {
    this.logger.debug(
      { invoiceId },
      'Fetching payment details and invoice items',
    )
    const { payments } = invoice
    const { id: invoicePaymentId } = payments?.data[0] || {}
    if (!invoicePaymentId) {
      this.logger.error({ invoiceId }, 'Invoice payment not found')
      throw new NotFoundError('Invoice Payment not found')
    }

    const invoicePayment =
      await this.paymentGatewayProvider.getInvoicePayment(invoicePaymentId)
    const { payment, status_transitions } = invoicePayment || {}
    const {
      latest_charge,
      payment_method,
      id: paymentIntentId,
    } = payment.payment_intent || {}
    if (!latest_charge) {
      this.logger.error(
        { invoiceId },
        'Missing latest charge in payment intent',
      )
      throw new UnexpectedError('Missing latest charge')
    }

    const invoiceItems = await this.cartRepository.manager.find(InvoiceItem, {
      where: { invoiceId, product: true },
    })

    this.logger.debug(
      { invoiceId, itemCount: invoiceItems.length },
      'Payment details and items fetched successfully',
    )
    return {
      paymentDetails: {
        receipt_url: latest_charge.receipt_url!,
        payment_method,
        paymentIntentId,
        paid_at: status_transitions.paid_at!,
      },
      invoiceItems,
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
    invoiceItems: InvoiceItem[],
  ) {
    this.logger.debug(
      { userId, invoiceId: invoice.id, itemCount: invoiceItems.length },
      'Creating order',
    )
    const totalAmount = invoiceItems.reduce(
      (prev, item) => prev + item.total,
      0,
    )

    const order = await this.orderRepository.createOrder(queryRunner, userId, {
      status: 'processing',
      totalAmount,
      invoiceId: invoice.id,
    })

    const orderItems = await Promise.all(
      invoiceItems.map(async ({ unitPrice, quantity, product }) => {
        return queryRunner.manager.create(OrderItem, {
          order,
          priceAtPurchase: unitPrice,
          product,
          quantity,
        })
      }),
    )

    await queryRunner.manager.save(orderItems)
    return order
  }

  /**
   * @description Update the status and payment details of the local invoice after a successful payment.
   */
  private async _updateLocalInvoice(
    queryRunner: QueryRunner,
    invoiceId: string,
    paymentDetails: PaymentDetails,
  ) {
    this.logger.debug({ invoiceId }, 'Updating local invoice')
    await queryRunner.manager.update(InvoiceEntity, invoiceId, {
      status: InvoiceStatus.PAID,
      paidAt: new Date((paymentDetails.paid_at || Date.now()) * 1000),
      paymentIntentId: paymentDetails.paymentIntentId,
    })
    this.logger.debug({ invoiceId }, 'Local invoice updated successfully')
  }

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
    }: ConfirmationEmailPayload,
  ) {
    this.logger.info(
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
        items: invoiceItems.map(({ unitPrice, quantity, total, product }) => ({
          quantity,
          unit_price: formatStripeAmount(unitPrice, currency),
          total: formatStripeAmount(total, currency),
          name: product.name,
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

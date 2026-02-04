import { FastifyBaseLogger } from 'fastify'
import { QueryRunner } from 'typeorm'

import dayjs from 'dayjs'
import Stripe from 'stripe'

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

import {
  Cart,
  CartItem,
  Invoice as InvoiceEntity,
  InvoiceItem,
  OrderItem,
  Product,
  StockReservation,
} from '#entities'

import { ICheckoutService } from './type'

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
   * @description Prepares the user's cart for checkout by reserving stock for each item.
   * This method initiates a database transaction to ensure atomicity.
   * @param userId The ID of the user whose cart is being prepared.
   */
  private async _prepareCheckout(userId: string): Promise<Cart> {
    this.logger.info({ userId }, 'Preparing checkout for user')
    const queryRuner =
      this.cartRepository.manager.connection.createQueryRunner()

    try {
      await queryRuner.connect()
      await queryRuner.startTransaction()
      this.logger.debug(
        { userId },
        'Transaction started for checkout preparation',
      )

      const cart = await queryRuner.manager
        .createQueryBuilder(Cart, 'cart')
        .setLock('pessimistic_write')
        .where('cart.user_id = :userId', { userId: userId })
        .getOne()

      if (!cart || cart.status !== 'active') {
        this.logger.warn(
          { userId, cartStatus: cart?.status },
          'Cart not payable',
        )
        throw new UnexpectedError('Cart not payable')
      }

      this.logger.debug(
        { userId, cartId: cart.id },
        'Cart found and locked for checkout',
      )

      const cartItems = await queryRuner.manager
        .createQueryBuilder(CartItem, 'cartItem')
        .where('cartItem.cart_id = :cartId', { cartId: cart.id })
        .leftJoinAndSelect('cartItem.product', 'product')
        .getMany()

      const deletedProduct = cartItems.find((item) => item.product.deleted)

      if (deletedProduct) {
        this.logger.error(
          {
            userId,
            productId: deletedProduct.product.id,
            productName: deletedProduct.product.name,
          },
          'Deleted product found in cart',
        )
        throw new UnexpectedError(
          `Product ${deletedProduct.product.name} is deleted`,
        )
      }

      const outOfStockProduct = cartItems.find(
        (item) => item.quantity > item.product.stock,
      )

      if (outOfStockProduct) {
        this.logger.error(
          {
            userId,
            productId: outOfStockProduct.product.id,
            productName: outOfStockProduct.product.name,
            requested: outOfStockProduct.quantity,
            available: outOfStockProduct.product.stock,
          },
          'Product out of stock',
        )
        throw new UnexpectedError(
          `Product ${outOfStockProduct.product.name} is out of stock`,
        )
      }

      await this._reserveStock(queryRuner, cart.id, cartItems)

      await queryRuner.commitTransaction()
      this.logger.info(
        { userId, cartId: cart.id, itemCount: cartItems.length },
        'Checkout prepared successfully',
      )
      return { ...cart, items: cartItems }
    } catch (error) {
      this.logger.error({ userId, error }, 'Error preparing checkout')
      await queryRuner.rollbackTransaction()
      throw new UnexpectedError('Failed to prepare Checkout')
    } finally {
      await queryRuner.release()
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
    this.logger.info(
      { userId, cartId: cart.id, invoiceId: paymentInvoice.id },
      'Creating local invoice',
    )
    const { id: cartId, items } = cart
    const { lines, currency, total, id: invoiceId } = paymentInvoice

    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner()

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

      await this._createInvoiceItems(queryRunner, invoice.id, items, lines.data)

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
    this.logger.debug(
      { invoiceId, itemCount: cartItems.length },
      'Creating invoice items',
    )
    try {
      const itemMap: Record<string, InvoiceLineItem> = {}
      for (const line of invoiceLineItems) {
        const { product } = line.pricing?.price_details || {}
        if (product) {
          itemMap[product] = line
        }
      }

      for (const item of cartItems) {
        const line = itemMap[item.product.id]
        const total = parseFloat((line?.subtotal || 0).toString())

        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          invoiceId,
          name: item.product.name,
          productId: item.product.id,
          quantity: item.quantity,
          total,
          unitPrice: total / item.quantity,
          id: line?.id,
        })

        await queryRunner.manager.save(invoiceItem)
      }
      this.logger.debug(
        { invoiceId, itemCount: cartItems.length },
        'Invoice items created successfully',
      )
    } catch (error) {
      this.logger.error({ invoiceId, error }, 'Error creating invoice items')
      throw new UnexpectedError('Failed to create local invoice items')
    }
  }

  /**
   * @description Generates a Stripe Payment Intent for preview purposes.
   * This involves preparing the checkout (reserving stock) and creating a Stripe invoice.
   * @param payload Stripe PaymentIntent creation parameters (e.g., currency).
   * @param userId The ID of the user.
   * @param userStripeId The Stripe customer ID of the user.
   */
  async generatePaymentIntent(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
    userStripeId: string,
  ): Promise<TResponse<Invoice>> {
    this.logger.info(
      { userId, userStripeId, currency: payload.currency },
      'Generating payment intent',
    )
    const cart = await this.cartRepository.getCartByUserId(userId)

    if (!cart) {
      this.logger.error({ userId }, 'Cart not found for payment intent')
      throw new NotFoundError('Cart not found')
    }

    const deletedProduct = cart.items.find((item) => item.product.deleted)

    if (deletedProduct) {
      this.logger.error(
        { userId, productId: deletedProduct.product.id },
        'Deleted product in cart',
      )
      throw new UnexpectedError(
        `Product ${deletedProduct.product.name} is deleted`,
      )
    }

    const outOfStockProduct = cart.items.find(
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

    const { currency } = payload

    const invoice = await this.paymentGatewayProvider.createInvoice({
      currency,
      customer: userStripeId,
    })

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
    )

    const finalizeInvoice = await this.paymentGatewayProvider.finalizeInvoice(
      invoice.id,
    )

    this.logger.info(
      { userId, invoiceId: invoice.id },
      'Payment intent generated successfully',
    )
    return finalizeInvoice
  }

  /**
   * @description Prepares the order for payment by preparing the checkout (reserving stock)
   * and creating a local invoice based on an existing opened Stripe invoice.
   * @param userId The ID of the user.
   * @param stripeId The Stripe customer ID of the user.
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
   * @param stripeId The Stripe customer ID.
   * @param invoiceId The Stripe Invoice ID.
   */
  async handleSuccessfulPayment(
    stripeId: string,
    invoiceId: string,
  ): Promise<void> {
    this.logger.info({ stripeId, invoiceId }, 'Handling successful payment')
    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner()
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
      if (!cart) {
        this.logger.warn(
          { userId: user.id },
          'No active cart found for successful payment',
        )
        return
      }

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

  /**
   * @description Private helper method to retrieve an active cart for a user within a transaction.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param userId The ID of the user.
   */
  private async _getCart(queryRunner: QueryRunner, userId: string) {
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
      return null
    }
    this.logger.debug({ userId, cartId: cart.id }, 'Cart fetched successfully')
    return cart
  }

  /**
   * @description Private helper method to fetch payment details and local invoice items from Stripe.
   * @param invoiceId The Stripe Invoice ID.
   * @param invoice The Stripe Invoice object.
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
      where: { invoiceId },
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
   * @description Private helper method to update product stock and convert stock reservations
   * to a 'converted' status after a successful order.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param cartId The ID of the cart associated with the order.
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
      invoiceItems.map(async ({ unitPrice, quantity, productId }) => {
        return queryRunner.manager.create(OrderItem, {
          order,
          priceAtPurchase: unitPrice,
          product: { id: productId },
          quantity,
        })
      }),
    )

    await queryRunner.manager.save(orderItems)
    return order
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
    this.logger.debug({ invoiceId }, 'Updating local invoice')
    await queryRunner.manager.update(InvoiceEntity, invoiceId, {
      status: InvoiceStatus.PAID,
      paidAt: new Date((paymentDetails.paid_at || Date.now()) * 1000),
      paymentIntentId: paymentDetails.paymentIntentId,
    })
    this.logger.debug({ invoiceId }, 'Local invoice updated successfully')
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
      paid_at: number
      receipt_url: string
      payment_method: string
      receipt_number: string
      invoice_url: string
      customer_name: string
      customer_email: string
      invoice_number: string
      currency: string
      total: number
    },
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
        items: invoiceItems.map(({ unitPrice, quantity, total, name }) => ({
          quantity,
          unit_price: formatStripeAmount(unitPrice, currency),
          total: formatStripeAmount(total, currency),
          name,
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

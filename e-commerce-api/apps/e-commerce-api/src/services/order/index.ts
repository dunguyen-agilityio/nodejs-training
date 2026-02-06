import { FastifyBaseLogger } from 'fastify'

import type {
  TCartRepository,
  TOrderRepository,
  TProductRepository,
} from '#repositories'

import { NotFoundError, OrderQueryParams, Pagination } from '#types'

import { Order, OrderItem, Product } from '#entities'

import { IOrderService } from './type'

export class OrderService implements IOrderService {
  constructor(
    private orderRepository: TOrderRepository,
    private cartRepository: TCartRepository,
    private productRepository: TProductRepository,
    private logger: FastifyBaseLogger,
  ) {}

  async createOrder(userId: string): Promise<Order> {
    this.logger.info({ userId }, 'Creating order from cart')
    // Start transaction
    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    this.logger.debug({ userId }, 'Transaction started for order creation')

    try {
      let order = await this.orderRepository.findOne({
        where: { user: { id: userId }, status: 'pending' },
        relations: { items: true },
      })

      const cart = await this.cartRepository.getCartByUserId(userId)

      if (!cart || !cart.items || cart.items.length === 0) {
        this.logger.error({ userId }, 'Cart is empty or not found')
        throw new NotFoundError('Cart is empty')
      }

      this.logger.debug(
        { userId, cartId: cart.id, itemCount: cart.items.length },
        'Cart retrieved for order',
      )

      const totalAmount = await cart.items.reduce(async (sumPromise, item) => {
        const sum = await sumPromise
        const product = await this.productRepository.getById(item.product.id)

        if (!product) {
          this.logger.error(
            { userId, productId: item.product.id },
            'Product not found in cart',
          )
          throw new NotFoundError('Product not found')
        }
        return sum + item.quantity * product.price
      }, Promise.resolve(0))

      this.logger.debug({ userId, totalAmount }, 'Total amount calculated')

      order = await queryRunner.manager.save(
        queryRunner.manager.create(Order, {
          user: { id: userId },
          status: 'pending',
          totalAmount,
          id: order?.id,
        }),
      )

      order.items = order.items || []

      const orderItemByProduct = order.items.reduce(
        (prev, item) => ({ ...prev, [item.product.id]: item.id }),
        {} as Record<string, number>,
      )

      // Create order items and decrease stock
      const orderItems = await Promise.all(
        cart.items.map(async (cartItem) => {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: cartItem.product.id },
          })

          if (!product) {
            this.logger.error(
              { userId, productId: cartItem.product.id },
              'Product not found during order creation',
            )
            throw new NotFoundError(`Product ${cartItem.product.id} not found`)
          }

          if (product.stock < cartItem.quantity) {
            this.logger.error(
              {
                userId,
                productId: product.id,
                requested: cartItem.quantity,
                available: product.stock,
              },
              'Insufficient stock for order',
            )
            throw new Error(`Insufficient stock for ${product.name}`)
          }

          // Create order item
          return queryRunner.manager.save(OrderItem, {
            order,
            priceAtPurchase: product.price,
            product,
            quantity: cartItem.quantity,
            id: orderItemByProduct[cartItem.product.id],
          })
        }),
      )

      await queryRunner.manager.save(orderItems)

      // Commit transaction
      await queryRunner.commitTransaction()
      this.logger.info(
        {
          userId,
          orderId: order.id,
          totalAmount,
          itemCount: orderItems.length,
        },
        'Order created successfully',
      )
      return order
    } catch (error) {
      // Rollback on error
      this.logger.error({ userId, error }, 'Error creating order')
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async getOrdersByUserId(
    userId: string,
    params: OrderQueryParams,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }> {
    this.logger.info(
      { userId, page: params.page, pageSize: params.pageSize },
      'Fetching orders for user',
    )
    const [count, orders] = await this.orderRepository.findOrdersByUserId(
      userId,
      params,
    )
    const result = {
      data: orders,
      meta: {
        pagination: {
          totalItems: count,
          itemsPerPage: params.pageSize,
          currentPage: params.page,
          totalPages: Math.ceil(count / params.pageSize),
          itemCount: orders.length,
        },
      },
    }

    this.logger.info(
      { userId, count, returnedCount: orders.length },
      'Orders fetched for user',
    )
    return result
  }

  async getOrders(
    params: OrderQueryParams,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }> {
    this.logger.info(
      { page: params.page, pageSize: params.pageSize },
      'Fetching all orders (admin)',
    )
    const [count, orders] = await this.orderRepository.findOrders(params)
    const result = {
      data: orders,
      meta: {
        pagination: {
          totalItems: count,
          itemsPerPage: params.pageSize,
          currentPage: params.page,
          totalPages: Math.ceil(count / params.pageSize),
          itemCount: orders.length,
        },
      },
    }

    this.logger.info(
      { count, returnedCount: orders.length },
      'All orders fetched',
    )
    return result
  }

  async updateOrderStatus(
    orderId: number,
    status: Order['status'],
  ): Promise<Order | null> {
    this.logger.info({ orderId, status }, 'Updating order status')
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    })

    if (!order) {
      this.logger.error({ orderId }, 'Order not found for status update')
      throw new NotFoundError('Order not found')
    }

    order.status = status
    await this.orderRepository.save(order)

    this.logger.info({ orderId, status }, 'Order status updated successfully')
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { items: { product: true }, user: true },
    })
  }
}

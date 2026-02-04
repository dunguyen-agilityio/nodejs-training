import { Order, OrderItem, Product } from '#entities'
import { NotFoundError, Pagination, Params } from '#types'

import type {
  TCartRepository,
  TOrderRepository,
  TProductRepository,
} from '#repositories'

import { IOrderService } from './type'

export class OrderService implements IOrderService {
  constructor(
    private orderRepository: TOrderRepository,
    private cartRepository: TCartRepository,
    private productRepository: TProductRepository,
  ) {}

  async createOrder(userId: string): Promise<Order> {
    // Start transaction
    const queryRunner =
      this.cartRepository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      let order = await this.orderRepository.findOne({
        where: { user: { id: userId }, status: 'pending' },
        relations: { items: true },
      })

      const cart = await this.cartRepository.getCartByUserId(userId)

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new NotFoundError('Cart is empty')
      }

      const totalAmount = await cart.items.reduce(async (sumPromise, item) => {
        const sum = await sumPromise
        const product = await this.productRepository.getById(item.product.id)

        if (!product) throw new NotFoundError('Product not found')
        return sum + item.quantity * product.price
      }, Promise.resolve(0))

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
            throw new NotFoundError(`Product ${cartItem.product.id} not found`)
          }

          if (product.stock < cartItem.quantity) {
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
      return order
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async getOrdersByUserId(
    userId: string,
    params: Omit<Params, 'query'>,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }> {
    const [count, orders] = await this.orderRepository.findOrdersByUserId(
      userId,
      params,
    )
    return {
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
  }

  async getOrders(
    params: Omit<Params, 'query'>,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }> {
    const [count, orders] = await this.orderRepository.findOrders(params)
    return {
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
  }

  async updateOrderStatus(
    orderId: number,
    status: Order['status'],
  ): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    order.status = status
    await this.orderRepository.save(order)

    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { items: { product: true }, user: true },
    })
  }
}

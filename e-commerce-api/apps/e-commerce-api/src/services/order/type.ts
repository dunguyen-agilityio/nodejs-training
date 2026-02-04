import { Pagination, ProductQueryParams } from '#types'

import { Order } from '#entities'

export interface IOrderService {
  getOrders(
    params: Omit<ProductQueryParams, 'query' | 'categories'>,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>
  createOrder(userId: string): Promise<Order>

  getOrdersByUserId(
    userId: string,
    params: Omit<ProductQueryParams, 'query' | 'categories'>,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>

  updateOrderStatus(
    orderId: number,
    status: Order['status'],
  ): Promise<Order | null>
}

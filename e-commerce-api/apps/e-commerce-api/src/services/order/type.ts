import { OrderQueryParams, Pagination } from '#types'

import { Order } from '#entities'

export interface IOrderService {
  getOrders(
    params: OrderQueryParams,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>
  createOrder(userId: string): Promise<Order>

  getOrdersByUserId(
    userId: string,
    params: OrderQueryParams,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>

  updateOrderStatus(
    orderId: number,
    status: Order['status'],
  ): Promise<Order | null>
}

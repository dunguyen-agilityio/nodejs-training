import { Order } from '#entities'
import { Pagination, Params } from '#types'

export interface IOrderService {
  getOrders(
    params: Omit<Params, 'query' | 'categories'>,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>
  createOrder(userId: string): Promise<Order>

  getOrdersByUserId(
    userId: string,
    params: Omit<Params, 'query' | 'categories'>,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>

  updateOrderStatus(
    orderId: number,
    status: Order['status'],
  ): Promise<Order | null>
}

import { Order } from "#entities";
import { Pagination, Params } from "#types/query";

export interface IOrderService {
  getOrders(
    params: Omit<Params, "query">,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>;
  createOrder(userId: string): Promise<Order>;

  getOrdersByUserId(
    userId: string,
    params: Omit<Params, "query">,
  ): Promise<{ data: Order[]; meta: { pagination: Pagination } }>;
}

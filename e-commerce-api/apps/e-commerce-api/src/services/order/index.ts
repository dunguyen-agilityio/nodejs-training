import { Order } from "#entities";
import { Params } from "#types/query";
import { AbstractOrderService } from "./type";

export class OrderService extends AbstractOrderService {
  async getOrdersByUserId(userId: string, params: Omit<Params, 'query'>): Promise<Order[]> {
    const orders = await this.orderRepository.findOrdersByUserId(userId, params);
    return orders;
  }

  async getOrders(params: Omit<Params, 'query'>): Promise<Order[]> {
    const orders = await this.orderRepository.findOrders(params);
    return orders;
  }
}

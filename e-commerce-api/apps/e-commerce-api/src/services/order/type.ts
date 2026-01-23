import { Order } from "#entities";
import { OrderItemRepository, OrderRepository } from "#repositories/types";
import { Dependencies } from "#services/base";
import { Params } from "#types/query";

export abstract class AbstractOrderService {
  protected orderRepository: OrderRepository;
  protected orderItemRepository: OrderItemRepository;

  constructor(dependencies: Partial<Dependencies>) {
    Object.assign(this, dependencies);
  }

  abstract getOrders(params: Omit<Params, 'query'>): Promise<Order[]>;

  abstract getOrdersByUserId(userId: string, params: Omit<Params, 'query'>): Promise<Order[]>;
}

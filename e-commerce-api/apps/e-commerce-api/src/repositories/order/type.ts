import { Order } from "#entities";
import { BaseRepository } from "#repositories/base";
import { Params } from "#types/query";

export abstract class AbstractOrderRepository extends BaseRepository<Order> {
    abstract findOrdersByUserId(userId: string, params: Omit<Params, 'query'>): Promise<Order[]>;


    abstract findOrders(params: Omit<Params, 'query'>): Promise<Order[]>;
}

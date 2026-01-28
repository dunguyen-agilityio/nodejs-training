import { Order } from "#entities";
import { BaseRepository } from "#repositories/base";
import { Params } from "#types/query";
import { QueryRunner } from "typeorm";

export abstract class AbstractOrderRepository extends BaseRepository<Order> {
  abstract findOrdersByUserId(
    userId: string,
    params: Omit<Params, "query">,
  ): Promise<[number, Order[]]>;
  abstract findPendingOrder(userId: string): Promise<Order | null>;
  abstract findOrders(
    params: Omit<Params, "query">,
  ): Promise<[number, Order[]]>;
  abstract createOrder(
    queryRunner: QueryRunner,
    userId: string,
    order: Partial<Order>,
  ): Promise<Order>;
}

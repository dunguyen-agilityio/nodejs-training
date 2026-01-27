import { Order } from "#entities";
import { Params } from "#types/query";
import { AbstractOrderRepository } from "./type";

export class OrderRepository extends AbstractOrderRepository {
  async findPendingOrder(userId: string): Promise<Order | null> {
    return await this.findOne({
      where: { user: { id: userId }, status: "pending" },
      relations: { items: { product: true } },
    });
  }

  async findOrdersByUserId(
    userId: string,
    params: Params,
  ): Promise<[number, Order[]]> {
    const { page, pageSize } = params;
    const [orders, count] = await this.findAndCount({
      where: { user: { id: userId } },
      relations: { items: { product: true } },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return [count, orders];
  }

  async findOrders(params: Params): Promise<[number, Order[]]> {
    const { page, pageSize } = params;
    const [orders, count] = await this.findAndCount({
      relations: { items: { product: true } },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return [count, orders];
  }
}

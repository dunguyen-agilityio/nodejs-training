import { Order } from "#entities";
import { Params } from "#types/query";
import { AbstractOrderRepository } from "./type";

export class OrderRepository extends AbstractOrderRepository {
    async findOrdersByUserId(userId: string, params: Params): Promise<Order[]> {
        const { page, pageSize } = params;
        const orders = await this.find({
            where: { user: { id: userId } },
            relations: { items: { product: true } },
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        return orders;
    }

    async findOrders(params: Params): Promise<Order[]> {
        const { page, pageSize } = params;
        const orders = await this.find({
            relations: { items: { product: true } },
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        return orders;
    }
}

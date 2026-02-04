import { QueryRunner } from 'typeorm'

import { ProductQueryParams } from '#types'

import { Order } from '#entities'

import { AbstractOrderRepository } from './type'

export class OrderRepository extends AbstractOrderRepository {
  async findPendingOrder(userId: string): Promise<Order | null> {
    return await this.findOne({
      where: { user: { id: userId }, status: 'pending' },
      relations: { items: { product: true } },
    })
  }

  async findOrdersByUserId(
    userId: string,
    params: ProductQueryParams,
  ): Promise<[number, Order[]]> {
    const { page, pageSize } = params
    const [orders, count] = await this.findAndCount({
      where: { user: { id: userId } },
      relations: { items: { product: true } },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })

    return [count, orders]
  }

  async findOrders(params: ProductQueryParams): Promise<[number, Order[]]> {
    const { page, pageSize } = params
    const [orders, count] = await this.findAndCount({
      relations: { items: { product: true } },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })

    return [count, orders]
  }

  async createOrder(
    queryRunner: QueryRunner,
    userId: string,
    data: Order,
  ): Promise<Order> {
    const order = await queryRunner.manager.save(
      queryRunner.manager.create(Order, {
        ...data,
        user: { id: userId },
      }),
    )
    return order
  }
}

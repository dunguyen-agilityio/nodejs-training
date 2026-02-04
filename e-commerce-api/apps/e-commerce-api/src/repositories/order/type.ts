import { QueryRunner } from 'typeorm'

import { BaseRepository } from '#repositories/base'

import { ProductQueryParams } from '#types'

import { Order } from '#entities'

export abstract class AbstractOrderRepository extends BaseRepository<Order> {
  abstract findOrdersByUserId(
    userId: string,
    params: Omit<ProductQueryParams, 'query'>,
  ): Promise<[number, Order[]]>
  abstract findPendingOrder(userId: string): Promise<Order | null>
  abstract findOrders(
    params: Omit<ProductQueryParams, 'query'>,
  ): Promise<[number, Order[]]>
  abstract createOrder(
    queryRunner: QueryRunner,
    userId: string,
    order: Partial<Order>,
  ): Promise<Order>
}

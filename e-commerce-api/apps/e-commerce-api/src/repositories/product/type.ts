import { QueryRunner } from 'typeorm'

import { Product } from '#entities'

import { ProductMetric } from '#types/metrics'
import { Params } from '#types/query'

import { BaseRepository } from '../base'

export abstract class AbstractProductRepository extends BaseRepository<Product> {
  abstract getById(id: string): Promise<Product | null>
  abstract getProducts(
    params: Omit<Params, 'page'> & { skip: number },
  ): Promise<[Product[], number]>

  abstract decreaseStock(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
  ): Promise<void>
  abstract getAdminMetrics(): Promise<ProductMetric | undefined>
}

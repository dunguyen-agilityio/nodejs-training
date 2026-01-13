import { Product } from '#entity'

import { AbstractRepository } from '../base'

export abstract class AbstractProductRepository extends AbstractRepository<Product> {
  abstract getById(id: number): Promise<Product>
  abstract getProducts(params: {
    query: string
    skip: number
    pageSize: number
  }): Promise<Product[]>
}

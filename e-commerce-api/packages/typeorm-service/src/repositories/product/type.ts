import { Product } from '#entity'

import { Repository } from 'typeorm'

export abstract class ProductRepository extends Repository<Product> {
  abstract getById(id: number): Promise<Product>
  abstract getProducts(params: {
    query: string
    page: number
    pageSize: number
  }): Promise<Product[]>
}

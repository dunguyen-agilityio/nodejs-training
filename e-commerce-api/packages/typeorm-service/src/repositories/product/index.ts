import { Product } from '#entity'

import { Repository } from 'typeorm'

import { AbstractProductRepository } from './type'

export class ProductRepository extends AbstractProductRepository {
  constructor(repository: Repository<Product>) {
    super(Product, repository.manager)
  }

  async getById(id: number): Promise<Product> {
    return this.findOneBy({ id })
  }

  async getProducts(params: {
    query: string
    skip: number
    pageSize: number
  }): Promise<Product[]> {
    const { query, skip, pageSize } = params

    return this.createQueryBuilder('product')
      .where('product.name LIKE :query OR product.description LIKE :query', {
        query: `%${query}%`,
      })
      .skip(skip)
      .take(pageSize)
      .getMany()
  }
}

export * from './type'

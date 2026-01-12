import { Product } from '#entity'

import { Repository } from 'typeorm'

import { ProductRepository } from './type'

class ProductRepositoryImpl extends ProductRepository {
  constructor(repository: Repository<Product>) {
    super(Product, repository.manager)
  }

  async getById(id: number): Promise<Product> {
    return this.findOneBy({ id })
  }

  async getProducts(params: {
    query: string
    page: number
    pageSize: number
  }): Promise<Product[]> {
    const { query, page, pageSize } = params
    const skip = (page - 1) * pageSize

    return this.createQueryBuilder('product')
      .where('product.name ILIKE :query OR product.description ILIKE :query', {
        query: `%${query}%`,
      })
      .skip(skip)
      .take(pageSize)
      .getMany()
  }
}

export { ProductRepositoryImpl as ProductRepository }

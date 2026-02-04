import { QueryRunner } from 'typeorm'

import { Product } from '#entities'
import { Params, ProductMetric } from '#types'

import { AbstractProductRepository } from './type'

export class ProductRepository extends AbstractProductRepository {
  async getById(id: string): Promise<Product | null> {
    return await this.findOne({
      where: { id },
      relations: { category: true },
    })
  }

  async getProducts(
    params: Omit<Params, 'page'> & { skip: number },
  ): Promise<[Product[], number]> {
    const { query, skip, categories, pageSize } = params

    const queryBuilder = this.createQueryBuilder('product')

    let where = ''

    const queryParams = {} as Record<string, any>

    if (query) {
      where += 'product.name ILIKE :query OR product.description ILIKE :query'
      queryParams.query = `%${query}%`
    }

    if (categories.length >= 1) {
      if (query) {
        where += ' AND '
      }
      where += 'LOWER(product.category) IN (:...categories)'
      queryParams.categories = categories.map((c) => c.toLowerCase())
    }

    queryBuilder
      .where(where, queryParams)
      .andWhere('product.deleted IS NULL OR product.deleted = :deleted', {
        deleted: false,
      })

    return queryBuilder
      .leftJoinAndSelect('product.category', 'category')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()
  }

  async decreaseStock(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await queryRunner.manager.findOne(Product, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    })

    if (!product) throw new Error('Product not found')
    if (product.stock < quantity) {
      throw new Error('Insufficient stock')
    }
    product.stock -= quantity
    await queryRunner.manager.save(product)
  }

  async getAdminMetrics(): Promise<ProductMetric | undefined> {
    const metric = await this.createQueryBuilder('product')
      .select('COUNT(product.id)', 'totalProducts')
      .addSelect('SUM(product.stock)', 'totalStock')
      .addSelect('SUM(product.price * product.stock)', 'totalValue')
      // Cache the result for 1 minute to protect the DB
      .cache('metrics', 60000)
      .getRawOne<ProductMetric>()

    return metric
  }
}

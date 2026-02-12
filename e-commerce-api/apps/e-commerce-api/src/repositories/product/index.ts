import { Brackets, QueryRunner } from 'typeorm'

import { ProductMetric, ProductQueryParams } from '#types'

import { Product } from '#entities'

import { AbstractProductRepository } from './type'

export class ProductRepository extends AbstractProductRepository {
  async getById(id: string): Promise<Product | null> {
    return await this.findById(id, {
      relations: { category: true },
    })
  }

  async getProducts(
    params: Omit<ProductQueryParams, 'page'> & { skip: number },
  ): Promise<[Product[], number]> {
    const {
      query,
      skip,
      categories,
      pageSize,
      status,
      orderBy = 'updatedAt',
      order = 'DESC',
    } = params

    const queryBuilder = this.createQueryBuilder('product')

    if (query) {
      // Use Brackets to isolate the OR logic
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :query', {
            query: `%${query}%`,
          }).orWhere('product.description ILIKE :query', {
            query: `%${query}%`,
          })
        }),
      )
    }

    if (categories.length >= 1) {
      queryBuilder.andWhere('LOWER(product.category) IN (:...categories)', {
        categories: categories.map((c) => c.toLowerCase()),
      })
    }

    // Logic for status
    const statusToFilter = status && status !== 'all' ? status : 'published'
    queryBuilder.andWhere('product.status = :status', {
      status: statusToFilter,
    })

    queryBuilder.orderBy(
      `product.${orderBy}`,
      order === 'DESC' ? 'DESC' : 'ASC',
    )

    return queryBuilder
      .leftJoinAndSelect('product.category', 'category')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()
  }

  async softDeleteById(id: string | number): Promise<void> {
    await this.update(id, { status: 'deleted' } as Partial<Product>)
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

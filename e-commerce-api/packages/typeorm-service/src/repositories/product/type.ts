import { Product } from '#entity'

import { Repository } from 'typeorm'

export abstract class AbstractProductRepository extends Repository<Product> {
  abstract getById(id: number): Promise<Product>
  abstract getProducts(params: {
    query: string
    skip: number
    pageSize: number
  }): Promise<Product[]>

  // Example: const products = await productRepository.find({
  //   where: { name: Like(`%${query}%`) },
  //   skip,
  //   take: pageSize
  // });
}

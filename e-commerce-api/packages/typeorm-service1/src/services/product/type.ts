import type { Product } from '#entity'

export abstract class AbstractProductService {
  abstract getProducts(params: {
    query: string
    page: number
    pageSize: number
  }): Promise<Product[]>
  abstract getProductById(id: number): Promise<Product>
  abstract saveProduct(product: Omit<Product, 'id'>): Promise<Product>
}

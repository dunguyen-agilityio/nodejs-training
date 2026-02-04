import { Pagination, ProductQueryParams } from '#types'

import { Product } from '#entities'

type PartialProduct = Partial<
  Pick<
    Product,
    'category' | 'description' | 'images' | 'name' | 'price' | 'stock'
  >
>

type ProductsResponse = { data: Product[]; meta: { pagination: Pagination } }
export interface IProductService {
  getProducts(params: ProductQueryParams): Promise<ProductsResponse>
  getProductById(id: string): Promise<Product | null>
  saveProduct(product: Omit<Product, 'id'>): Promise<Product>
  updateProduct(id: string, product: PartialProduct): Promise<Product>
  deleteProduct(id: string): Promise<void>
}

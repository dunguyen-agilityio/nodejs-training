import { FastifyBaseLogger } from 'fastify'

import type { TProductRepository } from '#repositories'

import {
  NotFoundError,
  Pagination,
  PartialProduct,
  PaymentGateway,
  ProductQueryParams,
} from '#types'

import { Product } from '#entities'

import { IProductService } from './type'

export class ProductService implements IProductService {
  constructor(
    private productRepository: TProductRepository,
    private paymentGatewayProvider: PaymentGateway,
    private logger: FastifyBaseLogger,
  ) {}

  async getProducts(
    params: ProductQueryParams,
  ): Promise<{ data: Product[]; meta: { pagination: Pagination } }> {
    this.logger.info(
      { query: params.query, page: params.page, pageSize: params.pageSize },
      'Fetching products',
    )
    const { query, page, pageSize, categories } = params
    const skip = (page - 1) * pageSize

    const [products, totalCount] = await this.productRepository.getProducts({
      pageSize,
      query,
      skip,
      categories,
    })

    const result = {
      data: products,
      meta: {
        pagination: {
          totalItems: totalCount,
          itemCount: products.length,
          itemsPerPage: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: Math.floor(skip / pageSize) + 1,
        },
      },
    }

    this.logger.info(
      { totalCount, returnedCount: products.length, page },
      'Products fetched successfully',
    )
    return result
  }

  async getProductById(id: string): Promise<Product | null> {
    this.logger.debug({ productId: id }, 'Fetching product by ID')
    const product = await this.productRepository.getById(id)

    if (product) {
      this.logger.debug({ productId: id }, 'Product found')
    } else {
      this.logger.debug({ productId: id }, 'Product not found')
    }
    return product
  }

  async saveProduct(payload: Omit<Product, 'id'>): Promise<Product> {
    this.logger.info(
      { name: payload.name, price: payload.price },
      'Creating new product',
    )
    try {
      const { price, name, images, description } = payload

      const newProduct = await this.paymentGatewayProvider.createProduct({
        name,
        description,
        images,
        active: true,
        default_price_data: {
          currency: 'usd',
          unit_amount: price * 100,
        },
      })

      this.logger.debug(
        { productId: newProduct.id, name },
        'Stripe product created',
      )

      const product = await this.productRepository.save({
        ...payload,
        id: newProduct.id,
      })

      this.logger.info(
        { productId: product.id, name: product.name },
        'Product created successfully',
      )
      return product
    } catch (error) {
      this.logger.error({ name: payload.name, error }, 'Error creating product')
      throw error
    }
  }

  async updateProduct(id: string, body: PartialProduct): Promise<Product> {
    this.logger.info(
      { productId: id, updates: Object.keys(body) },
      'Updating product',
    )
    const product = await this.getProductById(id)

    if (!product) {
      this.logger.error({ productId: id }, 'Product not found for update')
      throw new NotFoundError(`Not found Product by ID: ${id}`)
    }

    const updated = await this.productRepository.save({ ...product, ...body })
    this.logger.info({ productId: id }, 'Product updated successfully')
    return updated
  }

  async deleteProduct(id: string): Promise<void> {
    this.logger.info({ productId: id }, 'Deleting product (soft delete)')
    await this.productRepository.update(id, { deleted: true })
    this.logger.info({ productId: id }, 'Product deleted successfully')
  }
}

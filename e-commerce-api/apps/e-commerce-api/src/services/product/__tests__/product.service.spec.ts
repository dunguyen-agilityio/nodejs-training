import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '../index'
import { ProductRepository } from '#repositories/product'
import { PaymentGateway } from '#types'
import { FastifyBaseLogger } from 'fastify'
import { Product } from '#entities'

describe('ProductService', () => {
  let productService: ProductService
  let productRepositoryMock: ReturnType<typeof vi.mocked<ProductRepository>>
  let paymentGatewayProviderMock: ReturnType<typeof vi.mocked<PaymentGateway>>
  let loggerMock: ReturnType<typeof vi.mocked<FastifyBaseLogger>>

  beforeEach(() => {
    productRepositoryMock = {
      getProducts: vi.fn(),
      getById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<ProductRepository>>

    paymentGatewayProviderMock = {
      createProduct: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<PaymentGateway>>

    loggerMock = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<FastifyBaseLogger>>

    productService = new ProductService(
      productRepositoryMock,
      paymentGatewayProviderMock,
      loggerMock,
    )
  })

  describe('getProducts', () => {
    it('should return a list of products and pagination metadata', async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 10,
          stock: 5,
          category: {
            id: 'category-1',
            name: 'Category 1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: null,
        },
      ]
      const totalCount = 1

      productRepositoryMock.getProducts.mockResolvedValueOnce([
        mockProducts,
        totalCount,
      ])

      const params = {
        query: '',
        page: 1,
        pageSize: 10,
        categories: [],
      }

      // Act
      const result = await productService.getProducts(params)

      // Assert
      expect(productRepositoryMock.getProducts).toHaveBeenCalledWith({
        pageSize: 10,
        query: '',
        skip: 0,
        categories: [],
      })
      expect(result.data).toEqual(mockProducts)
      expect(result.meta.pagination).toEqual({
        totalItems: totalCount,
        itemCount: mockProducts.length,
        itemsPerPage: params.pageSize,
        totalPages: 1,
        currentPage: 1,
      })
      expect(loggerMock.info).toHaveBeenCalledWith(
        { query: params.query, page: params.page, pageSize: params.pageSize },
        'Fetching products',
      )
      expect(loggerMock.info).toHaveBeenCalledWith(
        { totalCount, returnedCount: mockProducts.length, page: params.page },
        'Products fetched successfully',
      )
    })
  })
})

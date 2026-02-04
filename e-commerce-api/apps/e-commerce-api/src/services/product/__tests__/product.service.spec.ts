import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createMockRepository,
  loggerMock,
  mockPaymentGateway,
} from '#test-utils'

import { Product } from '#entities'

import { ProductService } from '../index'

describe('ProductService', () => {
  let productService: ProductService
  let productRepositoryMock: ReturnType<typeof createMockRepository>

  beforeEach(() => {
    vi.clearAllMocks()

    productRepositoryMock = createMockRepository()

    productService = new ProductService(
      productRepositoryMock as any,
      mockPaymentGateway as any,
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
          reservedStock: 0,
          images: [],
          category: {
            id: 1,
            name: 'Category 1',
            description: 'Category description',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
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

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
        stock: 5,
        reservedStock: 0,
        images: [],
        category: {
          id: 1,
          name: 'Category 1',
          description: 'Category description',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      }
      productRepositoryMock.getById.mockResolvedValue(mockProduct)

      const result = await productService.getProductById('1')

      expect(result).toEqual(mockProduct)
      expect(productRepositoryMock.getById).toHaveBeenCalledWith('1')
      expect(loggerMock.debug).toHaveBeenCalledWith(
        { productId: '1' },
        'Product found',
      )
    })

    it('should return null when product not found', async () => {
      productRepositoryMock.getById.mockResolvedValue(null)

      const result = await productService.getProductById('999')

      expect(result).toBeNull()
      expect(loggerMock.debug).toHaveBeenCalledWith(
        { productId: '999' },
        'Product not found',
      )
    })
  })

  describe('saveProduct', () => {
    it('should create product with Stripe integration', async () => {
      const payload: Omit<Product, 'id'> = {
        name: 'New Product',
        description: 'New Description',
        price: 100,
        stock: 10,
        reservedStock: 0,
        category: {
          id: 1,
          name: 'Category',
          description: 'Category description',
        },
        images: ['image1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      }

      const stripeProduct = { id: 'stripe_123' }
      mockPaymentGateway.createProduct = vi.fn()
      mockPaymentGateway.createProduct.mockResolvedValue(stripeProduct)

      const savedProduct = { ...payload, id: 'stripe_123' }
      productRepositoryMock.save.mockResolvedValue(savedProduct as any)

      const result = await productService.saveProduct(payload)

      expect(mockPaymentGateway.createProduct).toHaveBeenCalledWith({
        name: payload.name,
        description: payload.description,
        images: payload.images,
        active: true,
        default_price_data: {
          currency: 'usd',
          unit_amount: payload.price * 100,
        },
      })
      expect(productRepositoryMock.save).toHaveBeenCalledWith({
        ...payload,
        id: 'stripe_123',
      })
      expect(result).toEqual(savedProduct)
    })

    it('should handle errors during product creation', async () => {
      const payload: Omit<Product, 'id'> = {
        name: 'New Product',
        description: 'New Description',
        price: 100,
        stock: 10,
        reservedStock: 0,
        category: {
          id: 1,
          name: 'Category',
          description: 'Category description',
        },
        images: ['image1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      }

      mockPaymentGateway.createProduct = vi.fn()
      mockPaymentGateway.createProduct.mockRejectedValue(
        new Error('Stripe error'),
      )

      await expect(productService.saveProduct(payload)).rejects.toThrow(
        'Stripe error',
      )
      expect(loggerMock.error).toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const existingProduct: Product = {
        id: '1',
        name: 'Old Name',
        description: 'Old Description',
        price: 50,
        stock: 5,
        reservedStock: 0,
        images: [],
        category: {
          id: 1,
          name: 'Category',
          description: 'Category description',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      }

      const updates = { name: 'New Name', price: 100 }
      const updatedProduct = { ...existingProduct, ...updates }

      productRepositoryMock.getById.mockResolvedValue(existingProduct)
      productRepositoryMock.save.mockResolvedValue(updatedProduct)

      const result = await productService.updateProduct('1', updates)

      expect(result).toEqual(updatedProduct)
      expect(productRepositoryMock.save).toHaveBeenCalledWith({
        ...existingProduct,
        ...updates,
      })
    })

    it('should throw NotFoundError when product does not exist', async () => {
      productRepositoryMock.getById.mockResolvedValue(null)

      await expect(
        productService.updateProduct('999', { name: 'New Name' }),
      ).rejects.toThrow('Not found Product by ID: 999')
    })
  })

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      productRepositoryMock.update.mockResolvedValue(undefined as any)

      await productService.deleteProduct('1')

      expect(productRepositoryMock.update).toHaveBeenCalledWith('1', {
        deleted: true,
      })
      expect(loggerMock.info).toHaveBeenCalledWith(
        { productId: '1' },
        'Product deleted successfully',
      )
    })
  })
})

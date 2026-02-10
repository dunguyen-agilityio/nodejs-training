import { FastifyRequest } from 'fastify'
import { createMockReply, createMockRequest } from '#test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IProductService } from '#services/types'

import { Product } from '#entities'

import { HttpStatus } from '#types'

import { ProductController } from '../index'

type ProductQuery = {
  page: string
  pageSize: string
  query: string
  category: string
}

// Mock dependencies
const mockProductService = {
  updateProduct: vi.fn(),
  saveProduct: vi.fn(),
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  deleteProduct: vi.fn(),
}

vi.mock('#dtos/product', () => ({
  productToObject: vi.fn((product) => ({ ...product, toObject: true })),
}))

describe('ProductController', () => {
  let productController: ProductController

  beforeEach(() => {
    vi.clearAllMocks()

    productController = new ProductController(
      mockProductService as unknown as IProductService,
    )
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Params: { id: string }
        Body: Partial<Pick<Product, 'name' | 'description' | 'price' | 'stock' | 'images' | 'category'>>
      }>>({
        params: { id: 'p1' },
        body: { name: 'Updated' },
      })
      const mockReply = createMockReply()
      mockProductService.updateProduct.mockResolvedValue({ name: 'Updated' })

      await productController.updateProduct(mockRequest, mockReply)

      expect(mockProductService.updateProduct).toHaveBeenCalledWith('p1', {
        name: 'Updated',
      })
      expect(mockReply.code).toHaveBeenCalledWith(HttpStatus.OK)
      expect(mockReply.send).toHaveBeenCalledWith({ name: 'Updated' })
    })
  })

  describe('addNewProduct', () => {
    it('should add new product successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Body: Omit<Product, 'id'>
      }>>({
        body: { name: 'New Product' } as Omit<Product, 'id'>,
      })
      const mockReply = createMockReply()
      mockProductService.saveProduct.mockResolvedValue({
        id: 'p2',
        name: 'New Product',
      })

      await productController.addNewProduct(mockRequest, mockReply)

      expect(mockProductService.saveProduct).toHaveBeenCalledWith({
        name: 'New Product',
      })
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.CREATED)
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: { id: 'p2', name: 'New Product' },
      })
    })
  })

  describe('getProducts', () => {
    it('should retrieve products successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Querystring: ProductQuery
      }>>({
        query: { page: '1', pageSize: '10', query: '', category: '' },
      })
      const mockReply = createMockReply()
      const mockResult = {
        data: [{ id: 'p1' }, { id: 'p2' }],
        meta: { total: 2 },
      }
      mockProductService.getProducts.mockResolvedValue(mockResult)

      await productController.getProducts(mockRequest, mockReply)

      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        query: '',
        categories: [],
      })
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: [
          { id: 'p1', toObject: true },
          { id: 'p2', toObject: true },
        ],
        meta: { total: 2 },
      })
    })
  })

  describe('getProduct', () => {
    it('should retrieve single product successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Params: { id: string }
      }>>({ params: { id: 'p1' } })
      const mockReply = createMockReply()
      const mockProduct = { id: 'p1', name: 'P1' }
      mockProductService.getProductById.mockResolvedValue(mockProduct)

      await productController.getProduct(mockRequest, mockReply)

      expect(mockProductService.getProductById).toHaveBeenCalledWith('p1')
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: { id: 'p1', name: 'P1', toObject: true },
      })
    })

    it('should return 404 if product not found', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Params: { id: string }
      }>>({ params: { id: 'p1' } })
      const mockReply = createMockReply()
      mockProductService.getProductById.mockResolvedValue(null)

      await productController.getProduct(mockRequest, mockReply)

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found',
      })
    })
  })

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Params: { id: string }
      }>>({ params: { id: 'p1' } })
      const mockReply = createMockReply()
      mockProductService.deleteProduct.mockResolvedValue(undefined)

      await productController.deleteProduct(mockRequest, mockReply)

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith('p1')
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Product deleted successfully',
      })
    })
  })
})

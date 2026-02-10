import { Repository } from 'typeorm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Product } from '#entities'

import { ProductRepository } from '../index'

describe('ProductRepository', () => {
  let productRepository: ProductRepository
  let mockManager: any
  let mockQueryBuilder: any

  beforeEach(() => {
    mockManager = {
      findOne: vi.fn(),
      save: vi.fn(),
    }

    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn(),
      getRawOne: vi.fn(),
      cache: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
    }

    const fakeRepo = new Repository(Product, mockManager)
    productRepository = new ProductRepository(fakeRepo)

    // Mock the inherited methods we use
    productRepository.findOne = vi.fn()
    productRepository.createQueryBuilder = vi
      .fn()
      .mockReturnValue(mockQueryBuilder)
  })

  describe('getById', () => {
    it('should find product by id', async () => {
      const mockProduct = { id: 'p1' } as Product
      ;(productRepository.findOne as any).mockResolvedValue(mockProduct)

      const result = await productRepository.getById('p1')

      expect(result).toEqual(mockProduct)
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p1' },
        relations: { category: true },
      })
    })
  })

  describe('getProducts', () => {
    it('should retrieve products with query params', async () => {
      const mockProducts = [{ id: 'p1' }]
      const mockCount = 1
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        mockProducts,
        mockCount,
      ])

      const result = await productRepository.getProducts({
        query: 'test',
        categories: ['cat1'],
        pageSize: 10,
        skip: 0,
      })

      expect(result).toEqual([mockProducts, mockCount])
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      )
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('product.name ILIKE :query'),
        expect.objectContaining({ query: '%test%' }),
      )
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(product.category) IN (:...categories)'),
        expect.objectContaining({ categories: ['cat1'] }),
      )
    })

    it('should filter by specific status', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0])

      await productRepository.getProducts({
        query: '',
        categories: [],
        pageSize: 10,
        skip: 0,
        status: 'draft',
      })

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.status = :status',
        { status: 'draft' },
      )
    })

    it('should default to published status if not provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0])

      await productRepository.getProducts({
        query: '',
        categories: [],
        pageSize: 10,
        skip: 0,
      })

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.status = :status',
        { status: 'published' },
      )
    })
  })

  describe('softDeleteById', () => {
    it('should update status to deleted', async () => {
      productRepository.update = vi.fn()

      await productRepository.softDeleteById('p1')

      expect(productRepository.update).toHaveBeenCalledWith('p1', {
        status: 'deleted',
      })
    })
  })

  describe('decreaseStock', () => {
    it('should decrease stock successfully', async () => {
      const mockQueryRunner = {
        manager: {
          findOne: vi.fn(),
          save: vi.fn(),
        },
      } as any

      const mockProduct = { id: 'p1', stock: 10 }
      mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct)

      await productRepository.decreaseStock(mockQueryRunner, 'p1', 5)

      expect(mockProduct.stock).toBe(5)
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(mockProduct)
    })

    it('should throw error if product not found', async () => {
      const mockQueryRunner = {
        manager: {
          findOne: vi.fn(),
        },
      } as any

      mockQueryRunner.manager.findOne.mockResolvedValue(null)

      await expect(
        productRepository.decreaseStock(mockQueryRunner, 'p1', 5),
      ).rejects.toThrow('Product not found')
    })

    it('should throw error if insufficient stock', async () => {
      const mockQueryRunner = {
        manager: {
          findOne: vi.fn(),
        },
      } as any

      const mockProduct = { id: 'p1', stock: 2 }
      mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct)

      await expect(
        productRepository.decreaseStock(mockQueryRunner, 'p1', 5),
      ).rejects.toThrow('Insufficient stock')
    })
  })

  describe('getAdminMetrics', () => {
    it('should return metrics', async () => {
      const mockMetrics = { totalProducts: 10 }
      mockQueryBuilder.getRawOne.mockResolvedValue(mockMetrics)

      const result = await productRepository.getAdminMetrics()

      expect(result).toEqual(mockMetrics)
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.cache).toHaveBeenCalled()
    })
  })
})

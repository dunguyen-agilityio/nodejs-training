import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotFoundError } from '#types'

import {
  createMockQueryRunner,
  createMockRepository,
  loggerMock,
} from '#test-utils'

import { OrderService } from '../index'

describe('OrderService', () => {
  let orderService: OrderService
  let orderRepositoryMock: ReturnType<typeof createMockRepository>
  let cartRepositoryMock: ReturnType<typeof createMockRepository>
  let productRepositoryMock: ReturnType<typeof createMockRepository>
  let queryRunnerMock: ReturnType<typeof createMockQueryRunner>

  beforeEach(() => {
    vi.clearAllMocks()

    queryRunnerMock = createMockQueryRunner()

    orderRepositoryMock = createMockRepository({
      findOrdersByUserId: vi.fn(),
      findOrders: vi.fn(),
    })

    cartRepositoryMock = createMockRepository({
      getCartByUserId: vi.fn(),
    })
    cartRepositoryMock.manager.connection.createQueryRunner.mockReturnValue(
      queryRunnerMock,
    )

    productRepositoryMock = createMockRepository({
      getById: vi.fn(),
    })

    orderService = new OrderService(
      orderRepositoryMock as any,
      cartRepositoryMock as any,
      productRepositoryMock as any,
      loggerMock,
    )
  })

  describe('createOrder', () => {
    const userId = 'user-1'
    const mockCart = {
      id: 1,
      items: [{ product: { id: 'prod-1' }, quantity: 2 }],
    }
    const mockProduct = {
      id: 'prod-1',
      price: 100,
      stock: 10,
      name: 'Product 1',
    }

    beforeEach(() => {
      cartRepositoryMock.getCartByUserId.mockResolvedValue(mockCart)
      productRepositoryMock.getById.mockResolvedValue(mockProduct)
      queryRunnerMock.manager.findOne.mockResolvedValue(mockProduct)
    })

    it('should successfully create an order from cart', async () => {
      orderRepositoryMock.findOne.mockResolvedValue(null) // No existing pending order

      const result = await orderService.createOrder(userId)

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.manager.save).toHaveBeenCalled() // Saved order and order items
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled()
      expect(result.totalAmount).toBe(200)
      expect(result.status).toBe('pending')
    })

    it('should throw NotFoundError if cart is empty', async () => {
      cartRepositoryMock.getCartByUserId.mockResolvedValue({ items: [] })

      await expect(orderService.createOrder(userId)).rejects.toThrow(
        NotFoundError,
      )
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
    })

    it('should throw Error if insufficient stock', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        ...mockProduct,
        stock: 1,
      })

      await expect(orderService.createOrder(userId)).rejects.toThrow(
        'Insufficient stock for Product 1',
      )
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
    })

    it('should rollback and throw on generic error', async () => {
      cartRepositoryMock.getCartByUserId.mockRejectedValue(
        new Error('DB Error'),
      )

      await expect(orderService.createOrder(userId)).rejects.toThrow('DB Error')
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.release).toHaveBeenCalled()
    })
  })

  describe('getOrdersByUserId', () => {
    it('should fetch orders with pagination', async () => {
      const userId = 'user-1'
      const params = { page: 1, pageSize: 10, categories: [] }
      const mockOrders = [{ id: 1 }, { id: 2 }]
      orderRepositoryMock.findOrdersByUserId.mockResolvedValue([2, mockOrders])

      const result = await orderService.getOrdersByUserId(userId, params)

      expect(result.data).toEqual(mockOrders)
      expect(result.meta.pagination.totalItems).toBe(2)
      expect(orderRepositoryMock.findOrdersByUserId).toHaveBeenCalledWith(
        userId,
        params,
      )
    })
  })

  describe('getOrders', () => {
    it('should fetch all orders with pagination (admin)', async () => {
      const params = { page: 1, pageSize: 10, categories: [] }
      const mockOrders = [
        { id: 1, user: { id: 'user-1' } },
        { id: 2, user: { id: 'user-2' } },
      ]
      orderRepositoryMock.findOrders.mockResolvedValue([2, mockOrders])

      const result = await orderService.getOrders(params)

      expect(result.data).toEqual(mockOrders)
      expect(result.meta.pagination.totalItems).toBe(2)
      expect(result.meta.pagination.currentPage).toBe(1)
      expect(result.meta.pagination.totalPages).toBe(1)
      expect(orderRepositoryMock.findOrders).toHaveBeenCalledWith(params)
      expect(loggerMock.info).toHaveBeenCalledWith(
        { page: params.page, pageSize: params.pageSize },
        'Fetching all orders (admin)',
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('should update status and return order', async () => {
      const orderId = 1
      const status = 'delivered'
      const mockOrder = { id: orderId, status: 'pending' }
      orderRepositoryMock.findOne.mockResolvedValueOnce(mockOrder)
      orderRepositoryMock.findOne.mockResolvedValueOnce({
        ...mockOrder,
        status,
      })

      const result = await orderService.updateOrderStatus(orderId, status)

      expect(orderRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ status }),
      )
      expect(result?.status).toBe(status)
    })

    it('should throw NotFoundError if order not found', async () => {
      orderRepositoryMock.findOne.mockResolvedValue(null)

      await expect(
        orderService.updateOrderStatus(1, 'delivered'),
      ).rejects.toThrow(NotFoundError)
    })
  })
})

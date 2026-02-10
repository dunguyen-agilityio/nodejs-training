import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TOrderRepository, TUserRepository } from '#repositories'

import { EmailProvider, PaymentGateway } from '#types'

import {
  createMockQueryRunner,
  createMockRepository,
  loggerMock,
  mockMailProvider,
  mockPaymentGateway,
} from '#test-utils'

import { CheckoutService } from '../index'

describe('CheckoutService', () => {
  let checkoutService: CheckoutService
  let userRepositoryMock: any
  let cartRepositoryMock: any
  let orderRepositoryMock: any
  let queryRunnerMock: any

  beforeEach(() => {
    vi.clearAllMocks()

    queryRunnerMock = createMockQueryRunner()

    userRepositoryMock = createMockRepository({
      getByStripeId: vi.fn(),
    })
    cartRepositoryMock = createMockRepository({
      getCartByUserId: vi.fn(),
      manager: {
        find: vi.fn(),
        connection: {
          createQueryRunner: vi.fn(() => queryRunnerMock),
        },
      },
    })
    orderRepositoryMock = createMockRepository({
      createOrder: vi.fn(),
      hasPendingOrder: vi.fn(),
      manager: {
        connection: {
          createQueryRunner: vi.fn(() => queryRunnerMock),
        },
      },
    })

    checkoutService = new CheckoutService(
      userRepositoryMock as unknown as TUserRepository,
      orderRepositoryMock as unknown as TOrderRepository,
      mockPaymentGateway as unknown as PaymentGateway,
      mockMailProvider as unknown as EmailProvider,
      loggerMock,
    )
  })

  describe('generatePaymentIntent', () => {
    const userId = 'user-1'
    const userStripeId = 'cus-1'
    const payload = { currency: 'usd' } as any

    it('should throw error if product is out of stock', async () => {
      const mockProduct = {
        id: 'p1',
        price: 100,
        name: 'P1',
        stock: 1, // Limited stock
        reservedStock: 0,
        status: 'published',
      }
      const mockCart = {
        id: 1,
        status: 'active',
        items: [
          {
            product: mockProduct,
            quantity: 5, // Requesting more than available
            productId: 'p1',
          },
        ],
      }

      const mockQueryBuilder = {
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockCart),
        getMany: vi
          .fn()
          .mockResolvedValueOnce(mockCart.items)
          .mockResolvedValueOnce([mockProduct]),
      }
      queryRunnerMock.manager.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      )

      userRepositoryMock.getByStripeId.mockResolvedValue({ id: userId })
      orderRepositoryMock.hasPendingOrder.mockResolvedValue(false)

      await expect(
        checkoutService.processPayment(payload, userStripeId),
      ).rejects.toThrow('Product P1 is out of stock') // Expect specific error message from validateCartItems

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
    })

    it('should throw error if cart is not active', async () => {
      const mockCart = {
        id: 1,
        status: 'completed', // Not active
        items: [],
      }

      const mockQueryBuilder = {
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockCart),
        getMany: vi.fn().mockResolvedValue([]),
      }
      queryRunnerMock.manager.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      )

      userRepositoryMock.getByStripeId.mockResolvedValue({ id: userId })
      orderRepositoryMock.hasPendingOrder.mockResolvedValue(false)

      await expect(
        checkoutService.processPayment(payload, userStripeId),
      ).rejects.toThrow('Cart not active or not found')

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
    })

    it('should throw error if cart is empty', async () => {
      const mockCart = {
        id: 1,
        status: 'active',
        items: [],
      }

      const mockQueryBuilder = {
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockCart),
        getMany: vi.fn().mockResolvedValue([]),
      }
      queryRunnerMock.manager.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      )

      userRepositoryMock.getByStripeId.mockResolvedValue({ id: userId })
      orderRepositoryMock.hasPendingOrder.mockResolvedValue(false)

      await expect(
        checkoutService.processPayment(payload, userStripeId),
      ).rejects.toThrow('Cart is empty')

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
    })
  })
  describe('releaseExpiredStockReservations', () => {
    it('should release expired reservations and update product stock', async () => {
      const expiredReservations = [
        {
          id: 1,
          productId: 'p1',
          quantity: 2,
          status: 'reserved',
        },
      ]
      const products = [{ id: 'p1', reservedStock: 5, stock: 10 }]

      const mockQueryBuilder = {
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi
          .fn()
          .mockResolvedValueOnce(expiredReservations)
          .mockResolvedValueOnce(products),
      }
      queryRunnerMock.manager.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      )

      await checkoutService.releaseExpiredStockReservations()

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled()

      // Verify product reserved stock update
      expect(products[0].reservedStock).toBe(3) // 5 - 2

      // Verify reservation status update
      expect(expiredReservations[0].status).toBe('released')

      expect(queryRunnerMock.manager.save).toHaveBeenCalledTimes(2)
    })

    it('should do nothing if no expired reservations found', async () => {
      const mockQueryBuilder = {
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      }
      queryRunnerMock.manager.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      )

      await checkoutService.releaseExpiredStockReservations()

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.manager.save).not.toHaveBeenCalled()
    })
  })
})

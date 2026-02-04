import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  TCartRepository,
  TOrderRepository,
  TUserRepository,
} from '#repositories'

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
    })

    checkoutService = new CheckoutService(
      userRepositoryMock as unknown as TUserRepository,
      cartRepositoryMock as unknown as TCartRepository,
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

    it('should successfully generate payment intent', async () => {
      const mockProduct = {
        id: 'p1',
        price: 100,
        name: 'P1',
        stock: 10,
        reservedStock: 0,
      }

      const mockCart = {
        id: 1,
        status: 'active',
        items: [
          {
            product: mockProduct,
            quantity: 1,
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

      queryRunnerMock.manager.save.mockResolvedValue({})
      queryRunnerMock.manager.create.mockReturnValue({})

      cartRepositoryMock.getCartByUserId.mockResolvedValue(mockCart)

      const mockInvoice = { id: 'inv-1', status: 'open' }
      mockPaymentGateway.createInvoice.mockResolvedValue(mockInvoice)
      mockPaymentGateway.createInvoiceItem.mockResolvedValue({})
      mockPaymentGateway.finalizeInvoice.mockResolvedValue(mockInvoice)

      const result = await checkoutService.generatePaymentIntent(
        payload,
        userId,
        userStripeId,
      )

      expect(result).toEqual(mockInvoice)
      expect(mockPaymentGateway.createInvoice).toHaveBeenCalled()
    })
  })

  describe('handleSuccessfulPayment', () => {
    it('should handle successful payment and create order', async () => {
      const stripeId = 'cus_1'
      const invoiceId = 'inv_1'
      const userId = 'user_1'
      const cartId = 1

      userRepositoryMock.getByStripeId.mockResolvedValue({
        id: userId,
        stripeId,
        email: 'test@example.com',
        name: 'Test User',
      })

      const mockInvoice = {
        id: invoiceId,
        customer: stripeId,
        customer_email: 'test@example.com',
        amount_paid: 1000,
        status: 'paid',
        currency: 'usd',
        total: 1000,
        number: 'INV-123',
        receipt_number: 'RCPT-123',
        invoice_pdf: 'http://invoice.pdf',
        payments: {
          data: [{ id: 'py_1' }],
        },
      }
      mockPaymentGateway.getInvoice.mockResolvedValue(mockInvoice)

      mockPaymentGateway.getInvoicePayment.mockResolvedValue({
        payment: {
          payment_intent: {
            id: 'pi_1',
            latest_charge: { receipt_url: 'http://receipt.url' },
            payment_method: {
              type: 'card',
              card: { brand: 'visa', last4: '4242' },
            },
          },
        },
        status_transitions: { paid_at: 1234567890 },
      })

      const mockInvoiceItems = [
        {
          id: 1,
          description: 'Item 1',
          amount: 1000,
          total: 1000,
          unitPrice: 1000,
          quantity: 1,
          name: 'Item 1',
        },
      ]
      cartRepositoryMock.manager.find.mockResolvedValue(mockInvoiceItems)

      const mockCart = { id: cartId, status: 'active', items: [] }

      const mockQueryBuilder = {
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockCart),
        getMany: vi
          .fn()
          .mockResolvedValueOnce([
            { productId: 'p1', quantity: 1, status: 'reserved' },
          ])
          .mockResolvedValueOnce([{ id: 'p1', stock: 10, reservedStock: 1 }]),
      }
      queryRunnerMock.manager.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      )

      const mockOrder = { id: 123, totalAmount: 1000 }
      orderRepositoryMock.createOrder.mockResolvedValue(mockOrder)

      queryRunnerMock.manager.delete.mockResolvedValue({})
      queryRunnerMock.manager.update.mockResolvedValue({})

      await checkoutService.handleSuccessfulPayment(stripeId, invoiceId)

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled()
      expect(mockMailProvider.sendWithTemplate).toHaveBeenCalled()
      expect(orderRepositoryMock.createOrder).toHaveBeenCalled()

      expect(loggerMock.info).toHaveBeenCalledWith(
        expect.objectContaining({ customer_email: 'test@example.com' }),
        'Confirmation email sent successfully',
      )
    })
  })

  describe('prepareOrderForPayment', () => {
    const userId = 'user-1'
    const stripeId = 'cus-1'

    it('should successfully prepare order for payment', async () => {
      const mockProduct = {
        id: 'p1',
        price: 100,
        name: 'P1',
        stock: 10,
        reservedStock: 0,
      }
      const mockCart = {
        id: 1,
        status: 'active',
        items: [
          {
            product: mockProduct,
            quantity: 1,
          },
        ],
      }
      const mockInvoice = {
        id: 'inv-1',
        lines: {
          data: [
            {
              id: 'li_1',
              amount: 1000,
              pricing: {
                price_details: { product: 'p1' },
              },
              currency: 'usd',
              total_amount: 1000,
              subtotal: 1000,
            },
          ],
        },
        currency: 'usd',
        total: 1000,
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

      queryRunnerMock.manager.create.mockReturnValue({})
      queryRunnerMock.manager.save.mockResolvedValue({})

      mockPaymentGateway.getOpenedInvoiceByUser.mockResolvedValue(mockInvoice)

      const result = await checkoutService.prepareOrderForPayment(
        userId,
        stripeId,
      )

      expect(result).toEqual(mockInvoice)
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled()
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled()
      expect(mockPaymentGateway.getOpenedInvoiceByUser).toHaveBeenCalledWith(
        stripeId,
      )
    })

    it('should throw error if product is out of stock', async () => {
      const mockProduct = {
        id: 'p1',
        price: 100,
        name: 'P1',
        stock: 1, // Limited stock
        reservedStock: 0,
      }
      const mockCart = {
        id: 1,
        status: 'active',
        items: [
          {
            product: mockProduct,
            quantity: 5, // Requesting more than available
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

      await expect(
        checkoutService.prepareOrderForPayment(userId, stripeId),
      ).rejects.toThrow('Failed to prepare Checkout')

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

      await expect(
        checkoutService.prepareOrderForPayment(userId, stripeId),
      ).rejects.toThrow('Failed to prepare Checkout')

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled()
    })
  })
})

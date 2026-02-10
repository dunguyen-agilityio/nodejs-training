import { FastifyRequest } from 'fastify'
import { createMockReply, createMockRequest } from '#test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ICartService } from '#services/types'

import { HttpStatus } from '#types'

import { CartController } from '../index'

const mockCartService = {
  getCartByUserId: vi.fn(),
  addProductToCart: vi.fn(),
  removeProductFromCart: vi.fn(),
}

describe('CartController', () => {
  let cartController: CartController

  beforeEach(() => {
    vi.clearAllMocks()

    cartController = new CartController(
      mockCartService as unknown as ICartService,
    )
  })

  describe('getCart', () => {
    it('should retrieve cart successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest>({
        auth: { userId: 'user_123', orgRole: 'user', stripeId: 'stripe_123' },
      })
      const mockReply = createMockReply()
      const mockCart = { id: 1, items: [] }
      mockCartService.getCartByUserId.mockResolvedValue(mockCart)

      await cartController.getCart(mockRequest, mockReply)

      expect(mockCartService.getCartByUserId).toHaveBeenCalledWith('user_123')
      expect(mockReply.send).toHaveBeenCalledWith({
        data: mockCart,
        success: true,
      })
    })
  })

  describe('addProductToCart', () => {
    it('should add product to cart successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Body: { productId: string; quantity: number }
      }>>({
        auth: { userId: 'user_123', orgRole: 'user', stripeId: 'stripe_123' },
        body: { productId: 'p1', quantity: 1 },
      })
      const mockReply = createMockReply()
      const mockCartItem = { id: 1, quantity: 1 }
      mockCartService.addProductToCart.mockResolvedValue(mockCartItem)

      await cartController.addProductToCart(mockRequest, mockReply)

      expect(mockCartService.addProductToCart).toHaveBeenCalledWith({
        userId: 'user_123',
        productId: 'p1',
        quantity: 1,
      })
      expect(mockReply.send).toHaveBeenCalledWith({
        data: mockCartItem,
        success: true,
      })
    })
  })

  describe('removeProductFromCart', () => {
    it('should remove product from cart successfully', async () => {
      const mockRequest = createMockRequest<FastifyRequest<{
        Params: { id: string }
      }>>({
        auth: { userId: 'user_123', orgRole: 'user', stripeId: 'stripe_123' },
        params: { id: '1' },
      })
      const mockReply = createMockReply()
      mockCartService.removeProductFromCart.mockResolvedValue(undefined)

      await cartController.removeProductFromCart(mockRequest, mockReply)

      expect(mockCartService.removeProductFromCart).toHaveBeenCalledWith(
        1,
        'user_123',
      )
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT)
      expect(mockReply.send).toHaveBeenCalled()
    })
  })
})

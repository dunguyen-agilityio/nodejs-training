import { FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ICartItemService } from '#services/types'

import { HttpStatus } from '#types'

import { createMockReply, createMockRequest } from '#test-utils'

import { CartItemController } from '../index'

// Mock dependencies
const mockCartItemService = {
  deleteCartItem: vi.fn(),
  updateCartItemQuantity: vi.fn(),
}

describe('CartItemController', () => {
  let cartItemController: CartItemController

  beforeEach(() => {
    vi.clearAllMocks()

    cartItemController = new CartItemController(
      mockCartItemService as unknown as ICartItemService,
    )
  })

  describe('deleteCartItem', () => {
    it('should delete cart item successfully', async () => {
      const mockRequest = createMockRequest<
        FastifyRequest<{
          Params: { id: string }
        }>
      >({
        auth: { userId: 'user_123', orgRole: 'user', stripeId: 'stripe_123' },
        params: { id: '1' },
      })
      const mockReply = createMockReply()
      mockCartItemService.deleteCartItem.mockResolvedValue(undefined)

      await cartItemController.deleteCartItem(mockRequest, mockReply)

      expect(mockCartItemService.deleteCartItem).toHaveBeenCalledWith(
        1,
        'user_123',
      )
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT)
      expect(mockReply.send).toHaveBeenCalled()
    })
  })

  describe('updateCartItemQuantity', () => {
    it('should update cart item quantity successfully', async () => {
      const mockRequest = createMockRequest<
        FastifyRequest<{
          Params: { id: string }
          Body: { quantity: string }
        }>
      >({
        auth: { userId: 'user_123', orgRole: 'user', stripeId: 'stripe_123' },
        params: { id: '1' },
        body: { quantity: '5' },
      })
      const mockReply = createMockReply()
      mockCartItemService.updateCartItemQuantity.mockResolvedValue(undefined)

      await cartItemController.updateCartItemQuantity(mockRequest, mockReply)

      expect(mockCartItemService.updateCartItemQuantity).toHaveBeenCalledWith(
        1,
        5,
      )
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(mockReply.send).toHaveBeenCalledWith({ success: true })
    })
  })
})

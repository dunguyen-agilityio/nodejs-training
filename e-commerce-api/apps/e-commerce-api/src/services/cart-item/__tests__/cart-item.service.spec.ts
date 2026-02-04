import { createMockRepository, loggerMock } from '#test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotFoundError } from '#types'

import { CartItemService } from '../index'

describe('CartItemService', () => {
  let cartItemService: CartItemService
  let cartItemRepositoryMock: ReturnType<typeof createMockRepository>

  beforeEach(() => {
    vi.clearAllMocks()

    cartItemRepositoryMock = createMockRepository({
      findOneBy: vi.fn(),
    })

    cartItemService = new CartItemService(
      cartItemRepositoryMock as any,
      loggerMock,
    )
  })

  describe('getCartItemByProduct', () => {
    it('should fetch cart item by product and cart', async () => {
      const productId = 'prod-1'
      const cartId = 1
      const mockItem = { id: 10, productId, cartId }
      cartItemRepositoryMock.findOneBy.mockResolvedValue(mockItem)

      const result = await cartItemService.getCartItemByProduct(
        productId,
        cartId,
      )

      expect(result).toEqual(mockItem)
      expect(cartItemRepositoryMock.findOneBy).toHaveBeenCalledWith({
        product: { id: productId },
        cartId,
      })
    })
  })

  describe('deleteCartItem', () => {
    it('should delete cart item if found', async () => {
      const cartItemId = 10
      const userId = 'user-1'
      const qb = cartItemRepositoryMock.createQueryBuilder()
      qb.execute.mockResolvedValue({ affected: 1 })
      cartItemRepositoryMock.createQueryBuilder.mockReturnValue(qb)

      await cartItemService.deleteCartItem(cartItemId, userId)

      expect(qb.delete).toHaveBeenCalled()
      expect(qb.where).toHaveBeenCalledWith('id = :cartItemId', { cartItemId })
      expect(qb.andWhere).toHaveBeenCalledWith(
        'cartId IN (SELECT id FROM carts WHERE user_id = :userId)',
        { userId },
      )
    })

    it('should throw NotFoundError if no item was deleted', async () => {
      const cartItemId = 10
      const userId = 'user-1'
      const qb = cartItemRepositoryMock.createQueryBuilder()
      qb.execute.mockResolvedValue({ affected: 0 })
      cartItemRepositoryMock.createQueryBuilder.mockReturnValue(qb)

      await expect(
        cartItemService.deleteCartItem(cartItemId, userId),
      ).rejects.toThrow(NotFoundError)
      expect(loggerMock.error).toHaveBeenCalled()
    })
  })

  describe('updateCartItemQuantity', () => {
    it('should update quantity if item found', async () => {
      const cartItemId = 10
      const quantity = 5
      const qb = cartItemRepositoryMock.createQueryBuilder()
      qb.execute.mockResolvedValue({ affected: 1 })
      cartItemRepositoryMock.createQueryBuilder.mockReturnValue(qb)

      const result = await cartItemService.updateCartItemQuantity(
        cartItemId,
        quantity,
      )

      expect(result).toBe(true)
      expect(qb.update).toHaveBeenCalledWith({ quantity })
      expect(qb.where).toHaveBeenCalledWith('id = :cartItemId', { cartItemId })
    })

    it('should throw NotFoundError if no item was updated', async () => {
      const cartItemId = 10
      const quantity = 5
      const qb = cartItemRepositoryMock.createQueryBuilder()
      qb.execute.mockResolvedValue({ affected: 0 })
      cartItemRepositoryMock.createQueryBuilder.mockReturnValue(qb)

      await expect(
        cartItemService.updateCartItemQuantity(cartItemId, quantity),
      ).rejects.toThrow(NotFoundError)
    })
  })
})

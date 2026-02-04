import { FastifyBaseLogger } from 'fastify'

import type { TCartItemRepository } from '#repositories'

import { NotFoundError } from '#types'

import { CartItem } from '#entities'

import { ICartItemService } from './type'

export class CartItemService implements ICartItemService {
  constructor(
    private cartItemRepository: TCartItemRepository,
    private logger: FastifyBaseLogger,
  ) {}

  async getCartItemByProduct(
    productId: string,
    cartId: number,
  ): Promise<CartItem | null> {
    this.logger.debug({ productId, cartId }, 'Fetching cart item by product')
    return await this.cartItemRepository.findOneBy({
      product: { id: productId },
      cartId,
    })
  }

  async deleteCartItem(cartItemId: number, userId: string): Promise<void> {
    this.logger.info({ cartItemId, userId }, 'Deleting cart item')
    const result = await this.cartItemRepository
      .createQueryBuilder('cartItem')
      .delete()
      .from('cart_items')
      .where('id = :cartItemId', { cartItemId })
      .andWhere('cartId IN (SELECT id FROM carts WHERE user_id = :userId)', {
        userId,
      })
      .execute()

    if (result.affected === 0) {
      this.logger.error(
        { cartItemId, userId },
        'Cart item not found or user lacks permission',
      )
      throw new NotFoundError('Item not found or user lacks permission')
    }

    this.logger.info(
      { cartItemId, userId, affected: result.affected },
      'Cart item deleted successfully',
    )
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> {
    this.logger.info({ cartItemId, quantity }, 'Updating cart item quantity')
    const result = await this.cartItemRepository
      .createQueryBuilder('cartItem')
      .update({ quantity })
      .where('id = :cartItemId', { cartItemId })
      .execute()

    if (result.affected === 0) {
      this.logger.error(
        { cartItemId, quantity },
        'Cart item not found or user lacks permission for update',
      )
      throw new NotFoundError('Item not found or user lacks permission')
    }

    this.logger.info(
      { cartItemId, quantity, affected: result.affected },
      'Cart item quantity updated successfully',
    )
    return true
  }
}

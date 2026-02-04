import { CartItem } from '#entities'

import { CartItemRepository } from '#repositories/types'

import { NotFoundError } from '#types/error'

import { ICartItemService } from './type'

export class CartItemService implements ICartItemService {
  constructor(private cartItemRepository: CartItemRepository) {}

  async getCartItemByProduct(
    productId: string,
    cartId: number,
  ): Promise<CartItem | null> {
    return await this.cartItemRepository.findOneBy({
      product: { id: productId },
      cartId,
    })
  }

  async deleteCartItem(cartItemId: number, userId: string): Promise<void> {
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
      throw new NotFoundError('Item not found or user lacks permission')
    }
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> {
    const result = await this.cartItemRepository
      .createQueryBuilder('cartItem')
      .update({ quantity })
      .where('id = :cartItemId', { cartItemId })
      .execute()

    if (result.affected === 0) {
      throw new NotFoundError('Item not found or user lacks permission')
    }

    return true
  }
}

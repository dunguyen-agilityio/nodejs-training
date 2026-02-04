import { CartItem } from '#entities'

export interface ICartItemService {
  getCartItemByProduct(
    productId: string,
    cartId: number,
  ): Promise<CartItem | null>
  deleteCartItem(cartItemId: number, userId: string): Promise<void>
  updateCartItemQuantity(cartItemId: number, quantity: number): Promise<boolean>
}

import { Cart, CartItem } from "#entities";
import { CartPayLoad } from "#types/cart";

export interface ICartService {
  addProductToCart(payload: CartPayLoad): Promise<CartItem>;
  removeProductFromCart(itemId: number, userId: string): Promise<boolean>;
  getCartByUserId(userId: string): Promise<Cart>;
  createCart(userId: string): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
}

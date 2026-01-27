import { Cart, CartItem } from "#entities";
import { CartPayLoad } from "#types/cart";
import { QueryRunner } from "typeorm";

export interface ICartService {
  addProductToCart(
    payload: CartPayLoad,
    dependencies: { queryRunner: QueryRunner },
  ): Promise<CartItem>;
  removeProductFromCart(itemId: number, userId: string): Promise<boolean>;
  deleteCart(cartId: number): Promise<boolean>;
  getCartByUserId(userId: string): Promise<Cart>;
  createCart(userId: string): Promise<Cart>;
  clearCart(userId: string): Promise<boolean>;
}

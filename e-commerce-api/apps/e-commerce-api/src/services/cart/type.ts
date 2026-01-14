import { Cart } from "#entities";
import { AbstractCartRepository } from "#repositories/types";
import { CartDependencies, CartPayLoad } from "../../types/cart";
import { BaseService } from "../base";

export abstract class AbstractCartService extends BaseService<
  Cart,
  AbstractCartRepository
> {
  abstract addProductToCart(
    payload: CartPayLoad,
    dependencies: CartDependencies
  ): Promise<Cart>;
  abstract getCart(cartId: number): Promise<Cart | null>;
  abstract getCartByUserId(userId: string): Promise<Cart | null>;
  abstract createCart(cart: Cart): Promise<Cart>;
}

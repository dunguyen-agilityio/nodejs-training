import { CartItem } from "#entities";
import { CartItemRepository, CartRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractCartItemService extends BaseService {
  protected cartitemRepository: CartItemRepository;
  protected cartRepository: CartRepository;

  // abstract save(
  //   cart: Pick<CartItem, "productId" | "quantity" | "cartId">
  // ): Promise<CartItem>;

  abstract getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null>;

  abstract deleteCartItem(
    cartItemId: number,
    userId: string
  ): Promise<{ success: boolean; message?: string }>;
}

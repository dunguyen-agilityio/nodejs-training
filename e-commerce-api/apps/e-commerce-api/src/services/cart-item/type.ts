import { CartItem } from "#entities";
import { AbstractCartItemRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractCartItemService extends BaseService<
  CartItem,
  AbstractCartItemRepository
> {
  abstract save(
    cart: Pick<CartItem, "productId" | "quantity" | "cartId">
  ): Promise<CartItem>;

  abstract getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null>;
}

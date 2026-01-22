import { CartItem } from "#entities";
import { CartItemRepository, CartRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractCartItemService extends BaseService {
  protected cartItemRepository: CartItemRepository = null!;
  protected cartRepository: CartRepository = null!;

  constructor(base: AbstractCartItemService, provider: BaseService) {
    super(provider);
    Object.assign(this, base);
  }

  abstract getCartItemByProduct(
    productId: number,
    cartId: number,
  ): Promise<CartItem | null>;

  abstract deleteCartItem(cartItemId: number, userId: string): Promise<void>;

  abstract updateCartItemQuantity(
    cartItemId: number,
    quantity: number,
  ): Promise<boolean>;
}

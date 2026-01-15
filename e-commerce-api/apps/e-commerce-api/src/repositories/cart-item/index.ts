import { CartItem } from "#entities";
import { AbstractCartItemRepository } from "./type";

export class CartItemRepository extends AbstractCartItemRepository {
  getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null> {
    return this.findOneBy({
      productId,
      cartId,
    });
  }
}

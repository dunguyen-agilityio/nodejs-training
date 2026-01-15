import { CartItem } from "#entities";
import { AbstractCartItemRepository } from "./type";

export class CartItemRepository extends AbstractCartItemRepository {
  async getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null> {
    return await this.findOneBy({
      product: { id: productId },
      cart: { id: cartId },
    });
  }
}

import { CartItem } from "#entities";
import { AbstractCartItemService } from "./type";

export class CartItemService extends AbstractCartItemService {
  async save(
    cart: Pick<CartItem, "productId" | "quantity" | "cartId">
  ): Promise<CartItem> {
    return await this.repository.save(cart);
  }

  async getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null> {
    return await this.repository.findOneBy({ productId, cartId });
  }
}

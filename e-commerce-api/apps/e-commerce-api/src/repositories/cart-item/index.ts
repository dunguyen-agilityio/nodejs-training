import { CartItem } from "#entities";
import { AbstractCartItemRepository } from "./type";

export class CartItemRepository extends AbstractCartItemRepository {
  getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null> {
    return this.findOneBy({
      product: { id: productId },
      cartId,
    });
  }

  async deleteCartItem(itemId: number, userId: string): Promise<boolean> {
    const result = await this.createQueryBuilder("cartItem")
      .delete()
      .from("cart_items")
      .where("id = :itemId", { itemId })
      .andWhere("cartId IN (SELECT id FROM carts WHERE user_id = :userId)", {
        userId,
      })
      .execute();

    return !!result.affected;
  }
}

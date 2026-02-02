import { CartItem } from "#entities";
import { AbstractCartItemRepository } from "./type";

export class CartItemRepository extends AbstractCartItemRepository {
  getCartItemByProduct(
    productId: string,
    cartId: number,
  ): Promise<CartItem | null> {
    return this.findOneBy({
      product: { id: productId },
      cartId,
    });
  }

  async deleteCartItem(cartItemId: number, userId: string): Promise<boolean> {
    const result = await this.createQueryBuilder("cartItem")
      .delete()
      .from("cart_items")
      .where("cartItemId = :cartItemId", { cartItemId })
      .andWhere("userId = :userId", { userId })
      .execute();

    return !!result.affected;
  }

  async deleteByCartId(cartId: number): Promise<boolean> {
    const result = await this.createQueryBuilder("cartItem")
      .delete()
      .from("cart_items")
      .where("cartId = :cartId", { cartId })
      .execute();

    return !!result.affected;
  }

  async getByCartId(cartId: number): Promise<CartItem[]> {
    const cartItems = await this.find({
      where: { cartId },
      relations: { product: true },
    });

    return cartItems;
  }
}

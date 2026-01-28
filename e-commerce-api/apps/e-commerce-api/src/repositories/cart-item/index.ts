import { CartItem } from "#entities";
import { QueryRunner } from "typeorm";
import { AbstractCartItemRepository } from "./type";

export class CartItemRepository extends AbstractCartItemRepository {
  getCartItemByProduct(
    productId: number,
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

  async clearCartItems(
    queryRunner: QueryRunner,
    cartId: number,
  ): Promise<void> {
    await queryRunner.manager.delete(CartItem, { cartId });
  }
}

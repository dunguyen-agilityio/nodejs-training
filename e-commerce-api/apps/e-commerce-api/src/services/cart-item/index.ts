import { CartItem } from "#entities";
import { NotFoundError } from "#types/error";
import { AbstractCartItemService } from "./type";

export class CartItemService extends AbstractCartItemService {
  // async save(
  //   cart: Pick<CartItem, "productId" | "quantity" | "cartId">
  // ): Promise<CartItem> {
  //   return await this.cartitemRepository.save(cart);
  // }

  async getCartItemByProduct(
    productId: number,
    cartId: number
  ): Promise<CartItem | null> {
    return await this.cartitemRepository.findOneBy({
      productId,
      cartId,
    });
  }

  async deleteCartItem(cartItemId: number, userId: string): Promise<void> {
    const result = await this.cartitemRepository
      .createQueryBuilder("cartItem")
      .delete()
      .from("cart_items")
      .where("id = :cartItemId", { cartItemId })
      .andWhere("cartId IN (SELECT id FROM carts WHERE user_id = :userId)", {
        userId,
      })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundError("Item not found or user lacks permission");
    }
  }
}

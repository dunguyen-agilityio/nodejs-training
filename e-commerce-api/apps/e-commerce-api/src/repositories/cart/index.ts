import { Cart } from "#entities";
import { AbstractCartRepository } from "./type";

export class CartRepository extends AbstractCartRepository {
  getCartByUserId(userId: string): Promise<Cart | null> {
    const cart = this.createQueryBuilder("cart")
      .leftJoinAndSelect("cart.items", "cartItem")
      .leftJoinAndSelect("cartItem.product", "product")
      .where("cart.userId = :userId", { userId })
      .getOne();

    return cart;
  }
}

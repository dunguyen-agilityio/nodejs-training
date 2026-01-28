import { CartItem } from "#entities";
import { QueryRunner } from "typeorm";
import { BaseRepository } from "../base";

export abstract class AbstractCartItemRepository extends BaseRepository<CartItem> {
  abstract getCartItemByProduct(
    productId: number,
    cartId: number,
  ): Promise<CartItem | null>;
  abstract deleteCartItem(cartItemId: number, userId: string): Promise<boolean>;

  abstract deleteByCartId(cartId: number): Promise<boolean>;

  abstract clearCartItems(
    queryRunner: QueryRunner,
    cartId: number,
  ): Promise<void>;
}

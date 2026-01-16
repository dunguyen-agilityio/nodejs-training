import { Cart } from "#entities";
import {
  CartItemRepository,
  CartRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import { CartPayLoad } from "#types/cart";
import { QueryRunner } from "typeorm";
import { BaseService } from "../base";

export abstract class AbstractCartService extends BaseService {
  protected cartRepository: CartRepository;
  protected cartItemRepository: CartItemRepository;
  protected userRepository: UserRepository;
  protected productRepository: ProductRepository;

  abstract addProductToCart(
    payload: CartPayLoad,
    dependencies: { queryRunner: QueryRunner }
  ): Promise<Cart>;
  abstract removeProductFromCart(
    itemId: number,
    userId: string
  ): Promise<boolean>;
  abstract deleteCart(cartId: number): Promise<boolean>;
  abstract getCartByUserId(userId: string): Promise<Cart>;
  abstract createCart(userId: string): Promise<Cart>;
}

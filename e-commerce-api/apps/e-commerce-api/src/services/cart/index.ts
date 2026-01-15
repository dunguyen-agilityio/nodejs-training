import { Cart, CartItem } from "#entities";
import { CartPayLoad } from "#types/cart";
import { QueryRunner } from "typeorm";
import { AbstractCartService } from "./type";
import { BadRequestError, NotFoundError } from "#types/error";

export class CartService extends AbstractCartService {
  async createCart(userId: string): Promise<Cart> {
    return await this.cartRepository.save({ user: { id: userId }, items: [] });
  }

  async addProductToCart(
    { productId, userId, quantity }: CartPayLoad,
    { queryRunner }: { queryRunner: QueryRunner }
  ): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    const product = await this.productRepository.getById(productId);

    if (!product) throw new NotFoundError(`Product ${productId} not found`);
    if (product.stock < quantity)
      throw new BadRequestError(`Insufficient stock for Product ${productId}`);

    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const existingItem = await manager.findOne(CartItem, {
        where: { cartId: cart.id, productId },
      });

      if (quantity === 0) {
        if (existingItem) {
          await manager.remove(existingItem);
        }
      } else {
        await manager.save(CartItem, {
          ...existingItem,
          productId,
          quantity,
          cartId: cart.id,
        });
      }

      await queryRunner.commitTransaction();
      return await this.getCartByUserId(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    let cart = await this.cartRepository
      .createQueryBuilder("cart")
      .leftJoinAndSelect("cart.items", "item")
      .leftJoinAndSelect("item.productId", "product")
      .where("cart.user_id = :userId", { userId })
      .getOne();

    if (!cart) {
      cart = await this.createCart(userId);
    }

    return cart;
  }

  async deleteCart(cartId: number): Promise<boolean> {
    const success = await this.cartRepository.delete(cartId);

    return !!success.affected;
  }
}

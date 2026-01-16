import { Cart, CartItem } from "#entities";
import { CartPayLoad } from "#types/cart";
import { QueryRunner } from "typeorm";
import { AbstractCartService } from "./type";
import { BadRequestError, NotFoundError } from "#types/error";

export class CartService extends AbstractCartService {
  async createCart(userId: string): Promise<Cart> {
    try {
      const newCart = this.cartRepository.create({
        userId,
        items: [],
        status: "active",
      });
      await this.cartRepository.insert(newCart);
      return newCart;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addProductToCart(
    { productId, userId, quantity }: CartPayLoad,
    { queryRunner }: { queryRunner: QueryRunner }
  ): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);

    const { id: cartId } = cart;

    const product = await this.productRepository.getById(productId);

    if (!product) throw new NotFoundError(`Product ${productId} not found`);
    if (product.stock < quantity)
      throw new BadRequestError(`Insufficient stock for Product ${productId}`);

    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const existingItem = await manager.findOne(CartItem, {
        where: { cartId, product: { id: productId } },
        relations: { product: true },
      });

      if (quantity === 0) {
        if (existingItem) {
          await manager.remove(existingItem);
        }
      } else {
        await manager.save(CartItem, {
          ...existingItem,
          product,
          quantity,
          cartId,
        });
      }

      await queryRunner.commitTransaction();
      const cart = await this.getCartByUserId(userId);
      return cart!;
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
      .leftJoinAndSelect("item.product", "product")
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

  async removeProductFromCart(
    itemId: number,
    userId: string
  ): Promise<boolean> {
    return this.cartItemRepository.deleteCartItem(itemId, userId);
  }
}

import { Cart, CartItem } from "#entities";
import { CartPayLoad } from "#types/cart";
import { QueryRunner } from "typeorm";
import { ICartService } from "./type";
import { BadRequestError, NotFoundError, UnexpectedError } from "#types/error";
import {
  CartItemRepository,
  CartRepository,
  ProductRepository,
} from "#repositories/types";
import { Dependencies } from "#services/base";

export class CartService implements ICartService {
  private cartRepository: CartRepository;
  private cartItemRepository: CartItemRepository;
  private productRepository: ProductRepository;

  constructor(dependencies: Dependencies) {
    Object.assign(this, dependencies);
  }

  async createCart(userId: string): Promise<Cart> {
    try {
      const newCart = this.cartRepository.create({
        user: { id: userId },
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
    { queryRunner }: { queryRunner: QueryRunner },
  ): Promise<CartItem> {
    const cart = await this.getCartByUserId(userId);

    const { id: cartId } = cart;

    const product = await this.productRepository.getById(productId);

    if (!product) throw new NotFoundError(`Product ${productId} not found`);
    if (product.stock < quantity)
      throw new BadRequestError(`Insufficient stock for Product ${productId}`);

    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      let cartItem = await manager.findOne(CartItem, {
        where: { cartId, product: { id: productId } },
        relations: { product: true },
      });

      if (quantity === 0) {
        if (cartItem) {
          await manager.remove(cartItem);
        }
      } else {
        cartItem = await manager.save(CartItem, {
          ...cartItem,
          product,
          quantity,
          cartId,
        });
      }

      if (!cartItem) throw new UnexpectedError();

      await queryRunner.commitTransaction();
      return cartItem;
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
    userId: string,
  ): Promise<boolean> {
    return this.cartItemRepository.deleteCartItem(itemId, userId);
  }

  async clearCart(userId: string): Promise<boolean> {
    const cart = await this.getCartByUserId(userId);
    // delete all items in cart
    await this.cartItemRepository.deleteCartItem(cart.id, userId);
    return this.deleteCart(cart.id);
  }
}

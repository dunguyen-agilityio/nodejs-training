import { Cart } from "#entities";
import { CartDependencies, CartPayLoad } from "../../types/cart";
import { AbstractCartService } from "./type";

export class CartService extends AbstractCartService {
  async getCart(cartId: number): Promise<Cart | null> {
    return await this.repository.findOneBy({ id: cartId });
  }

  async createCart(cart: Pick<Cart, "userId">): Promise<Cart> {
    return await this.repository.save(cart);
  }

  async addProductToCart(
    { productId, userId, quantity }: CartPayLoad,
    dependencies: CartDependencies
  ): Promise<Cart> {
    const { cartItemService, productService } = dependencies;
    let cart = await this.getCartByUserId(userId);
    if (!cart) {
      cart = await this.createCart({ userId });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      throw new Error(`Not found Product by ID: ${productId}`);
    }

    if (product.stock < quantity) {
      throw new Error(
        `Currectly Product: ${productId} have ${product.stock} < ${quantity}`
      );
    }

    let cartItem = await cartItemService.getCartItemByProduct(
      productId,
      cart.id
    );

    if (cartItem?.quantity !== quantity) {
      cartItem = await cartItemService.save({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    return cart;
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    try {
      return await this.repository.findOne({ where: { status: "active" } });
    } catch (error) {
      console.log("error", error);
      throw new Error("Oke");
    }
  }
}

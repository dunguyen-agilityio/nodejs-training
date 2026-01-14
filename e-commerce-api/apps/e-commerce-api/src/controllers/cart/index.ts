import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCartController } from "./type";
import { getAuth } from "@clerk/fastify";

export class CartController extends AbstractCartController {
  getCart = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const { userId } = getAuth(request);
    const cart = await this.service.getCartByUserId(userId!);
    reply.send(cart);
  };

  addProductToCart = async (
    request: FastifyRequest<{ Body: { productId: number; quantity: number } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { productId, quantity } = request.body;
    const { userId } = getAuth(request);

    const cartItemService = request.container.getItem("CartItem").service;
    const productService = request.container.getItem("Product").service;

    const cart = await this.service.addProductToCart(
      {
        userId: userId ?? "",
        productId,
        quantity,
      },
      { cartItemService, productService }
    );

    reply.send(cart);
  };
}

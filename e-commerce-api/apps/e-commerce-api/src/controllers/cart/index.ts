import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCartController } from "./type";
import { getAuth } from "@clerk/fastify";
import { UnexpectedError } from "#types/error";
import { HttpStatus } from "#types/http-status";

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

    const cart = await this.service.addProductToCart(
      {
        userId: userId ?? "",
        productId,
        quantity,
      },
      { queryRunner: request.container.queryRunner }
    );

    reply.send(cart);
  };

  deleteCart = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const id = parseInt(request.params.id);
    const success = await this.service.deleteCart(id);
    if (!success) throw new UnexpectedError(`Cannot delete Cart by ID: ${id}`);
    reply.status(HttpStatus.NO_CONTENT).send();
  };
}

import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCartItemController } from "./type";
import { HttpStatus } from "#types/http-status";

export class CartItemController extends AbstractCartItemController {
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {};

  deleteCartItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.service.deleteCartItem(
      parseInt(request.params.id),
      request.userId,
    );

    reply.status(HttpStatus.NO_CONTENT).send();
  };

  updateCartItemQuantity = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { quantity: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = parseInt(request.params.id);
    const quantity = parseInt(request.body.quantity);
    await this.service.updateCartItemQuantity(id, quantity);
    reply.status(HttpStatus.OK).send({ success: true });
  };
}

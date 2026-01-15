import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCartItemController } from "./type";
import { HttpStatus } from "#types/http-status";

export class CartItemController extends AbstractCartItemController {
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {};

  deleteCartItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    await this.service.deleteCartItem(
      parseInt(request.params.id),
      request.userId
    );

    reply.status(HttpStatus.NO_CONTENT).send();
  };
}

import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCartItemController } from "./type";

export class CartItemController extends AbstractCartItemController {
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {};

  deleteCartItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { success, message } = await this.service.deleteCartItem(
      parseInt(request.params.id),
      request.userId
    );

    if (!success) {
      return reply.status(500).send({
        success: false,
        error: message || "Internal server error",
      });
    }

    reply.status(204).send();
  };
}

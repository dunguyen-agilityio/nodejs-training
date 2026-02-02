import { FastifyRequest, FastifyReply } from "fastify";
import { HttpStatus } from "#types/http-status";
import { ICartItemService } from "#services/types";

export class CartItemController implements CartItemController {
  constructor(private service: ICartItemService) {}

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {};

  deleteCartItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.service.deleteCartItem(
      parseInt(request.params.id),
      request.auth.userId,
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

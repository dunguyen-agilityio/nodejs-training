import { FastifyReply, FastifyRequest } from "fastify";

export interface ICartItemController {
  getAll(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  deleteCartItem(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  updateCartItemQuantity(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;
}

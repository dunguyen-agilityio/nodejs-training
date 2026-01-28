import { FastifyReply, FastifyRequest } from "fastify";

export interface ICartController {
  addProductToCart(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  removeProductFromCart(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;
  getCart(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

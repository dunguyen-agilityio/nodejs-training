import { FastifyReply, FastifyRequest } from "fastify";

export interface ICheckoutController {
  createPaymentIntent(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;

  checkout(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

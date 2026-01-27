import { FastifyReply, FastifyRequest } from "fastify";

export interface ICheckoutController {
  createPaymentIntent(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;

  checkoutSuccess(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  invoicePaymentSuccess(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;
}

import { FastifyReply, FastifyRequest } from "fastify";

export interface ICheckoutController {
  createPaymentIntent(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;

  checkout(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  createPreviewInvoice(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;
  preCheckout(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

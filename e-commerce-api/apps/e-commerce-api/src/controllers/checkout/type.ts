import { PaymentService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";

export abstract class AbstractPaymentController {
  constructor(protected service: PaymentService) {}

  abstract createPaymentIntent(
    request: FastifyRequest<{ Body: { amount: string; currency: string } }>,
    reply: FastifyReply
  ): Promise<void>;
  abstract checkoutSuccess(
    request: FastifyRequest<{ Body: { amount: string; currency: string } }>,
    reply: FastifyReply
  ): Promise<void>;
}

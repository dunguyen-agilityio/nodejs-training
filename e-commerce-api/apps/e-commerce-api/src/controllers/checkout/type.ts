import { TStripePaymentGateway } from "#services";
import { CheckoutService, PaymentGateway } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";

export abstract class AbstractCheckoutController {
  constructor(
    protected service: CheckoutService,
    // protected service: PaymentGateway<Stripe, TStripePaymentGateway>,
  ) {}

  abstract createPaymentIntent(
    request: FastifyRequest<{ Body: { amount: string; currency: string } }>,
    reply: FastifyReply,
  ): Promise<void>;
  abstract checkoutSuccess(
    request: FastifyRequest<{
      Body: {
        data: {
          object: { id: string; customer: string; customer_account: string };
        };
        type: "payment_intent.succeeded";
      };
    }>,
    reply: FastifyReply,
  ): Promise<void>;
}

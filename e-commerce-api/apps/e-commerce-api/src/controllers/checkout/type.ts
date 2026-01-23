import { checkoutSuccessSchema, createPaymentIntentSchema } from "#schemas/checkout";
import { CheckoutService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";


export abstract class AbstractCheckoutController {
  constructor(protected service: CheckoutService,) { }

  abstract createPaymentIntent(
    request: FastifyRequest<{ Body: FromSchema<typeof createPaymentIntentSchema> }>,
    reply: FastifyReply,
  ): Promise<void>;

  abstract checkoutSuccess(
    request: FastifyRequest<{
      Body: FromSchema<typeof checkoutSuccessSchema>
    }>,
    reply: FastifyReply,
  ): Promise<void>;
}

import { UnauthorizedError } from "#types/error";
import { FastifyReply, FastifyRequest } from "fastify";
import { AbstractCheckoutController } from "./type";
import {
  checkoutSuccessSchema,
  createPaymentIntentSchema,
} from "#schemas/checkout";
import { FromSchema } from "json-schema-to-ts";

export class CheckoutController extends AbstractCheckoutController {
  createPaymentIntent = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof createPaymentIntentSchema>;
    }>,
    reply: FastifyReply,
  ) => {
    const amount = parseInt(request.body.amount);
    const currency = request.body.currency;
    const userId = request.auth.userId;

    if (!userId) throw new UnauthorizedError();

    const paymentIntent = await this.service.createCheckoutPayment(
      { amount, currency },
      userId,
    );

    reply.send({ clientSecret: paymentIntent.client_secret });
  };

  checkoutSuccess = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof checkoutSuccessSchema>;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { type, data } = request.body;

    if (type === "payment_intent.succeeded") {
      const customer = data.object.customer;
      await this.service.checkout(customer, data.object.id);
    }

    reply.send({ received: true });
  };
}

import { UnauthorizedError, UnexpectedError } from "#types/error";
import { FastifyReply, FastifyRequest } from "fastify";
import { ICheckoutController } from "./type";
import {
  checkoutSuccessSchema,
  createPaymentIntentSchema,
  paymentSuccessSchema,
} from "#schemas/checkout";
import { FromSchema } from "json-schema-to-ts";
import { ICheckoutService } from "#services/types";
import { formatStripeAmount } from "#utils/format";

export class CheckoutController implements ICheckoutController {
  constructor(private service: ICheckoutService) {}

  createPaymentIntent = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof createPaymentIntentSchema>;
    }>,
    reply: FastifyReply,
  ) => {
    const { amount, currency } = request.body;
    const userId = request.auth.userId;

    if (!userId) throw new UnauthorizedError();

    const invoice = await this.service.createCheckoutPayment(
      { amount, currency },
      userId,
    );

    const { confirmation_secret } = invoice;

    if (!confirmation_secret) {
      throw new UnexpectedError();
    }

    const { client_secret } = confirmation_secret;
    reply.send({ clientSecret: client_secret });
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

  invoicePaymentSuccess = async (
    request: FastifyRequest<{ Body: FromSchema<typeof paymentSuccessSchema> }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { data, type } = request.body;

    if (type === "invoice.payment_succeeded") {
      const { id: invoiceId, customer } = data.object;
      await this.service.checkout(customer, invoiceId);
    }

    reply.send({ received: true });
  };
}

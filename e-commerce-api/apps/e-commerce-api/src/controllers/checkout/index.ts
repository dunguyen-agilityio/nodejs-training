import { UnauthorizedError } from "#types/error";
import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { AbstractCheckoutController } from "./type";

export class CheckoutController extends AbstractCheckoutController {
  createPaymentIntent = async (
    request: FastifyRequest<{ Body: { amount: string; currency: string } }>,
    reply: FastifyReply,
  ) => {
    const amount = parseInt(request.body.amount);
    const currency = request.body.currency || "usd";

    const { userId } = getAuth(request);

    if (!userId) throw new UnauthorizedError();

    const paymentIntent = await this.service.createCheckoutPayment(
      { amount, currency },
      userId,
    );

    reply.send({ clientSecret: paymentIntent.client_secret });
  };

  checkoutSuccess = async (
    request: FastifyRequest<{
      Body: {
        data: {
          object: { id: string; customer: string; customer_account: string };
        };
        type: "payment_intent.succeeded";
      };
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

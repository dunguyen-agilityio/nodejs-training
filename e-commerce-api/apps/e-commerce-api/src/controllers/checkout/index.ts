import { NotFoundError, UnauthorizedError } from "#types/error";
import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { AbstractPaymentController } from "./type";
import { convertToSubcurrency } from "#utils/convertToSubcurrency";

export class PaymentController extends AbstractPaymentController {
  createPaymentIntent = async (
    request: FastifyRequest<{ Body: { amount: string; currency: string } }>,
    reply: FastifyReply
  ) => {
    const amount = parseInt(request.body.amount);
    const currency = request.body.currency || "usd";
    const { userId } = getAuth(request);
    if (!userId) throw new UnauthorizedError();

    const userService = request.container.getItem("userService");

    const user = await userService.getById(userId);

    if (!user) {
      throw new NotFoundError("Not found user");
    }

    const paymentIntent = await this.service.createPaymentIntent({
      amount: convertToSubcurrency(amount),
      currency,
      customer: user?.stripeId,
    });

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
    reply: FastifyReply
  ): Promise<void> => {
    const { type, data } = request.body;
    if (type === "payment_intent.succeeded") {
      console.log(data.object);
      const customer = data.object.customer || "cus_TolHQ0zqb2w6bs";

      await this.service.checkout1(customer, data.object.id);
    }

    reply.send({ received: true });
  };
}

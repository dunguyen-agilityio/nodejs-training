import { UnauthorizedError } from "#types/error";
import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { AbstractPaymentController } from "./type";
import { convertToSubcurrency } from "#utils/convertToSubcurrency";
import { Payment } from "#utils/container";

export class PaymentController extends AbstractPaymentController {
  createPaymentIntent = async (
    request: FastifyRequest<{ Body: { amount: string; currency: string } }>,
    reply: FastifyReply
  ) => {
    const amount = parseInt(request.body.amount);
    const currency = request.body.currency || "usd";
    const { userId } = getAuth(request);
    if (!userId) throw new UnauthorizedError();

    const customerId = "cus_TolHQ0zqb2w6bs";

    const paymentIntent = await this.service.createPaymentIntent({
      amount: convertToSubcurrency(amount),
      currency,
      customer: customerId,
    });

    reply.send({ clientSecret: paymentIntent.client_secret });
  };

  checkoutSuccess = async (
    request: FastifyRequest<{
      Body: {
        data: {
          object: { id: string; customer: string; customer_account: string };
        };
      };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    console.log(request.body.data.object);
    const customer = request.body.data.object.customer;
    const customerId = await request.payment.getCustomer(customer);
    // TODO: clear cart current
    // this.service.checkout(customerId, )
    console.info("Checkout payment.intent,successed", true);
    reply.send(true);
  };
}

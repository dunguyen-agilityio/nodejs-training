import { UnexpectedError } from "#types/error";
import { FastifyReply, FastifyRequest } from "fastify";
import { ICheckoutController } from "./type";
import {
  createPaymentIntentSchema,
  paymentSuccessSchema,
} from "#schemas/checkout";
import { FromSchema } from "json-schema-to-ts";
import { ICheckoutService } from "#services/types";

export class CheckoutController implements ICheckoutController {
  constructor(private service: ICheckoutService) {}

  createPaymentIntentHandler = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof createPaymentIntentSchema>;
    }>,
    reply: FastifyReply,
  ) => {
    const { amount, currency } = request.body;
    const { stripeId, userId } = request.auth;

    const invoice = await this.service.generatePaymentIntent(
      { amount, currency },
      userId,
      stripeId,
    );

    const { confirmation_secret } = invoice;

    if (!confirmation_secret) {
      throw new UnexpectedError();
    }

    const { client_secret } = confirmation_secret;
    reply.send({ clientSecret: client_secret });
  };

  // createPaymentIntentHandler1 = async (
  //   request: FastifyRequest<{
  //     Body: FromSchema<typeof createPaymentIntentSchema>;
  //   }>,
  //   reply: FastifyReply,
  // ) => {
  //   const userService = request.container.getItem("UserService");
  //   const paymentGateway = request.container.getItem("PaymentGatewayProvider");
  //   const { amount, currency } = request.body;
  //   const userId = request.auth.userId;

  //   if (!userId) throw new UnauthorizedError();

  //   const user = await userService.getById(userId);

  //   if (!user) {
  //     throw new NotFoundError("Not found user");
  //   }

  //   const { stripeId } = user;

  //   if (!stripeId) {
  //     const { email, name } = user;
  //     const stripeUser = await paymentGateway.findOrCreateCustomer({
  //       email,
  //       name,
  //     });

  //     user.stripeId = stripeUser.id;
  //     await userService.save(user);
  //   }

  //   const invoice = await this.service.createCheckoutPayment(
  //     { amount, currency },
  //     user,
  //   );

  //   const { confirmation_secret } = invoice;

  //   if (!confirmation_secret) {
  //     throw new UnexpectedError();
  //   }

  //   const { client_secret } = confirmation_secret;
  //   reply.send({ clientSecret: client_secret });
  // };

  /**
   * @description Prepares an order for checkout. This is a prerequisite step before confirming the payment.
   * @param request
   * @param reply
   */
  prepareOrderHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { stripeId, userId } = request.auth;
    await this.service.prepareOrderForPayment(userId, stripeId);
    reply.status(204).send();
  };

  stripeWebhookHandler = async (
    request: FastifyRequest<{ Body: FromSchema<typeof paymentSuccessSchema> }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { data, type } = request.body;

    if (type === "invoice.payment_succeeded") {
      const { id: invoiceId, customer } = data.object;
      await this.service.handleSuccessfulPayment(customer, invoiceId);
    }

    reply.send({ received: true });
  };
}

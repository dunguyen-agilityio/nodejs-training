import { validateRequest } from "#middlewares";
import { paymentSuccessSchema } from "#schemas/checkout";
import { FastifyPluginCallback } from "fastify";

const createPaymentIntentSchema = {
  body: {
    type: "object",
    required: ["currency"],
    properties: {
      currency: { type: "string", pattern: "^[a-z]{3}$", default: "usd" },
    },
  },
};

export const checkoutRoutes: FastifyPluginCallback = (instance, opts, done) => {
  const container = instance.container.getItem("CheckoutController");
  instance.post(
    "/create",
    { schema: createPaymentIntentSchema },
    container.createPaymentIntent,
  );
  instance.post(
    "/webhooks",
    { preHandler: [validateRequest], schema: { body: paymentSuccessSchema } },
    container.checkout,
  );
  done();
};

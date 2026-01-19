import { FastifyPluginCallback } from "fastify";

const createPaymentIntentSchema = {
  body: {
    type: "object",
    required: ["amount"],
    properties: {
      amount: { type: "string", pattern: "^[0-9]+$" },
      currency: { type: "string", pattern: "^[a-z]{3}$", default: "usd" },
    },
  },
};

export const checkoutRoutes: FastifyPluginCallback = (instance, opts, done) => {
  const container = instance.container.getItem("paymentController");
  instance.post(
    "/create-payment-intent",
    { schema: createPaymentIntentSchema },
    container.createPaymentIntent
  );
  instance.post("/checkout/webhooks", container.checkoutSuccess);
  done();
};

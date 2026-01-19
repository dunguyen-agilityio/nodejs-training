import { FastifyPluginCallback } from "fastify";

export const checkoutRoutes: FastifyPluginCallback = (instance, opts, done) => {
  const container = instance.container.getItem("paymentController");
  instance.post("/create-payment-intent", container.createPaymentIntent);
  instance.post("/checkout/webhooks", container.checkoutSuccess);
  done();
};

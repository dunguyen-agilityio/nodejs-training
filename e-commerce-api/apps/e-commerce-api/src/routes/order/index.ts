import { authenticate } from "#middlewares";
import { FastifyPluginCallback } from "fastify";

export const orderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("OrderController");

  instance.get("/", { preHandler: [authenticate] }, controller.getOrders);

  done();
};

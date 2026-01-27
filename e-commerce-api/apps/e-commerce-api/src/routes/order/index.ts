import { authenticate } from "#middlewares";
import { getOrdersSchema } from "#schemas/order";
import { FastifyPluginCallback } from "fastify";

export const orderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("OrderController");

  instance.get(
    "/",
    { preHandler: [authenticate], schema: { querystring: getOrdersSchema } },
    controller.getOrders,
  );

  done();
};

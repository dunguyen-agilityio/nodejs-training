import { authenticate } from "#middlewares";
import { getOrdersSchema } from "#schemas/order";
import { FastifyPluginCallback } from "fastify";

export const orderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container1.controllers.orderController

  instance.get(
    "/",
    { preHandler: [authenticate], schema: { querystring: getOrdersSchema } },
    controller.getOrders,
  );

  done();
};

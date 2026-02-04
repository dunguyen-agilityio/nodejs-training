import { authenticate, authorizeAdmin } from "#middlewares";
import { FastifyPluginCallback } from "fastify";

export const metricRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.metricController;

  instance.get(
    "/product",
    {
      preHandler: [authenticate, authorizeAdmin],
    },
    controller.getProductMetrics,
  );

  done();
};

import { FastifyPluginCallback } from "fastify";

export const categoryRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("categoryController");
  instance.get(
    "/",

    controller.getAll
  );

  done();
};

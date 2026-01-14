import { authenticate } from "#middlewares";
import { FastifyPluginCallback } from "fastify";

export const cartRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("Cart").controller;
  instance.post(
    "/add",
    { preHandler: [authenticate] },
    controller.addProductToCart
  );
  instance.get("/", { preHandler: [authenticate] }, controller.getCart);
  done();
};

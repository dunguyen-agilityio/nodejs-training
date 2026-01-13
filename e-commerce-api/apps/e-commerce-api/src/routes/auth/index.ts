import { FastifyPluginCallback } from "fastify";

export const authRoutes: FastifyPluginCallback = (instance, options, done) => {
  const controller = instance.container.getItem("Auth").controller;
  instance.post("/login", controller.login);
  instance.post("/register", controller.register);
  done();
};

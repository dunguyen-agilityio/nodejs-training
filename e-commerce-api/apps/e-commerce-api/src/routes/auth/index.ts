import { FastifyPluginCallback } from "fastify";

export const authRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("authController");
  instance.post("/login", controller.login);
  instance.post("/register", controller.register);
  instance.post("/webhooks", controller.register);
  done();
};

import { FastifyPluginCallback } from "fastify";
import { AuthController } from "../../controllers";

export const createAuthroutes: (
  controller: AuthController
) => FastifyPluginCallback = (controller) => (instance, options, done) => {
  instance.post("/login", controller.login);
  instance.post("/register", controller.register);

  done();
};

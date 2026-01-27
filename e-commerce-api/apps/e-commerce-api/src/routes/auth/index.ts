import { validateRequest } from "#middlewares";
import { loginBodySchema, registerBodySchema } from "#schemas/auth.schema";
import { FastifyPluginCallback } from "fastify";

export const authRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("AuthController");
  instance.post(
    "/login",
    { schema: { body: loginBodySchema }, attachValidation: true },
    controller.login,
  );
  instance.post(
    "/register",
    {
      schema: { body: registerBodySchema },
      attachValidation: true,
      preHandler: [validateRequest as any],
    },
    controller.register,
  );
  instance.post("/webhooks", controller.register);

  done();
};

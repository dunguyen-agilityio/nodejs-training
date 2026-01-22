import { FastifyPluginCallback } from "fastify";
import { organizationMembershipCreatedJsonSchema } from "#schemas/user-created";

export const userRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("UserController");
  instance.post(
    "/add-role",
    { schema: { body: organizationMembershipCreatedJsonSchema } },
    controller.addRoleForUser,
  );

  done();
};

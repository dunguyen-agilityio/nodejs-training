import { FastifyRequest, FastifyReply } from "fastify";
import { FromSchema } from "json-schema-to-ts";

import { IUserController } from "./type";

import { organizationMembershipCreatedJsonSchema } from "#schemas/user-created";
import { IUserService } from "#services/types";

export class UserController implements IUserController {
  constructor(private service: IUserService) {}

  addRoleForUser = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof organizationMembershipCreatedJsonSchema>;
    }>,
    reply: FastifyReply,
  ) => {
    const { public_user_data, role_name } = request.body.data;
    const userId = public_user_data.user_id;
    const success = await this.service.addRoleForUser(userId, role_name);
    reply.send({ success });
  };
}

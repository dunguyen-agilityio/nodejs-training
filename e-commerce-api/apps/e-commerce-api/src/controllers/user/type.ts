import { FastifyRequest, FastifyReply } from "fastify";

import { BaseController } from "../base";
import { UserService } from "#services/types";

export abstract class AbstractUserController extends BaseController<UserService> {
  abstract addRoleForUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

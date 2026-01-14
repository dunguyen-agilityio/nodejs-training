import { FastifyRequest, FastifyReply } from "fastify";

import { BaseController } from "../base";
import { User } from "#entities";
import { AbstractUserService } from "#services/types";

export abstract class AbstractUserController extends BaseController<
  User,
  AbstractUserService
> {
  abstract getUserById(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract addRoleForUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

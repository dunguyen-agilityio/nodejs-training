import { FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "../base";
import { User } from "#entities";
import { AbstractAuthService } from "#services/types";

export abstract class AbstractAuthController extends BaseController<
  User,
  AbstractAuthService
> {
  abstract login(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  abstract register(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

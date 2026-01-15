import { FastifyRequest, FastifyReply } from "fastify";

import { BaseController } from "../base";

import { AuthService } from "#services/types";

export abstract class AbstractAuthController extends BaseController<AuthService> {
  abstract login(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  abstract register(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

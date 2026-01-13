import { FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "../base";
import { User } from "@repo/typeorm-service";

export abstract class AbstractAuthController extends BaseController<User> {
  abstract login(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  abstract register(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

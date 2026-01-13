import { FastifyRequest, FastifyReply } from "fastify";

export abstract class AbstractUserController {
  abstract getUserById(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

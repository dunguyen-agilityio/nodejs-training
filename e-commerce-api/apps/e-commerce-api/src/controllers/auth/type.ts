import { FastifyRequest, FastifyReply } from "fastify";

export abstract class AuthController {
  abstract login(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  abstract register(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

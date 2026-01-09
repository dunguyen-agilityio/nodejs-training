import { FastifyRequest, FastifyReply } from "fastify";

export abstract class AuthControler {
  abstract login(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

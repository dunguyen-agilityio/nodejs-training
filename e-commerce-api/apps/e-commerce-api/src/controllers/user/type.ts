import { FastifyRequest, FastifyReply } from "fastify";

export interface IUserController {
  addRoleForUser(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

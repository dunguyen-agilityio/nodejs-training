import { FastifyReply, FastifyRequest } from "fastify";

export interface ICategoryController {
  getAll(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

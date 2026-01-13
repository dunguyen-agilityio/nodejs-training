import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractUserController } from "./type";
import { AbstractUserService } from "#services/types";

export class UserController implements AbstractUserController {
  constructor(private service: AbstractUserService) {}

  getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ user: null });
  };
}

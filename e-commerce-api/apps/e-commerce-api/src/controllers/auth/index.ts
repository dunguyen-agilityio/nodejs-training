import { FastifyRequest, FastifyReply } from "fastify";
import { getAuth, UserJSON } from "@clerk/fastify";

import { AbstractAuthController } from "./type";
import { transformatFromClerk } from "../../dtos/user";
import { HttpStatus } from "#types/http-status";

export class AuthController extends AbstractAuthController {
  register = async (
    request: FastifyRequest<{ Body: { data: UserJSON } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const newUser = transformatFromClerk(request.body.data);
    const user = await this.service.register(newUser);
    reply
      .code(HttpStatus.CREATED)
      .send({ message: "User registered successfully.", user });
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { isAuthenticated, getToken } = getAuth(request);

    if (!isAuthenticated) {
      reply
        .code(HttpStatus.FORBIDDEN)
        .send({ message: "Access denied. Authentication required." });
    } else {
      reply.send({ jwt: await getToken() });
    }
  };
}

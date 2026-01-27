import { FastifyRequest, FastifyReply } from "fastify";

import { IAuthController } from "./type";
import { transformatFromClerk } from "../../dtos/user";
import { HttpStatus } from "#types/http-status";
import { isClerkAPIResponseError } from "#utils/clerk";
import { BadRequestError } from "#types/error";
import { loginBodySchema, registerBodySchema } from "#schemas/auth.schema";
import { FromSchema } from "json-schema-to-ts";
import { IAuthService } from "#services/types";

export class AuthController implements IAuthController {
  constructor(private service: IAuthService) {}

  register = async (
    request: FastifyRequest<{ Body: FromSchema<typeof registerBodySchema> }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const newUser = transformatFromClerk(request.body);
    const user = await this.service.register(newUser);
    reply
      .code(HttpStatus.CREATED)
      .send({ message: "User registered successfully.", user });
  };

  login = async (
    request: FastifyRequest<{ Body: FromSchema<typeof loginBodySchema> }>,
    reply: FastifyReply,
  ) => {
    if (request.validationError) {
      reply.code(HttpStatus.BAD_REQUEST).send(request.validationError);
      return;
    }
    const { identifier, password } = request.body;

    try {
      const { jwt, data } = await this.service.login({ identifier, password });

      reply.send({ jwt, data });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        throw new BadRequestError(error.errors[0].message);
      }

      throw error;
    }
  };
}

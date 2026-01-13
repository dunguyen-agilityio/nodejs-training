import { FastifyRequest, FastifyReply } from "fastify";
import { getAuth } from "@clerk/fastify";

import { AbstractAuthController } from "./type";
import { UserCreatedMinimal } from "../../types/user-created";
import { User } from "#entities";

export class AuthController extends AbstractAuthController {
  register = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const userCreated = (request.body as UserCreatedMinimal).data;

    if (!userCreated) {
      reply.code(401).send({ error: "User not authenticated" });
      return;
    }

    const {
      email_addresses,
      first_name: firstName,
      id,
      image_url,
      last_name: lastName,
      username,
      created_at: createdAt,
      updated_at: updatedAt,
      phone_numbers,
    } = userCreated;

    const newUser = new User({
      avatar: image_url,
      lastName,
      id,
      username,
      firstName,
      email: email_addresses[0]?.email_address || "",
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      phone: phone_numbers[0]?.phone_number || "",
    });

    // const user = await request.AuthService.register(newUser);
    reply.code(201).send({ message: "User registered successfully.", newUser });
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { isAuthenticated, getToken } = getAuth(request);

    if (!isAuthenticated) {
      reply
        .code(403)
        .send({ message: "Access denied. Authentication required." });
    } else {
      reply.send({ jwt: await getToken() });
    }
  };
}

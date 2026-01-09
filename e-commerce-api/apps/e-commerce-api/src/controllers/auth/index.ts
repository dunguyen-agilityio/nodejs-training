import { FastifyRequest, FastifyReply } from "fastify";
import { AuthControler } from "./type";
import { clerkClient, getAuth } from "@clerk/fastify";
import { UserCreatedMinimal } from "../../types/user-created";
import { User } from "@repo/typeorm-service";
import { AuthService } from "../../services/auth/type";

class AuthControllerImpl extends AuthControler {
  constructor(private service: AuthService) {
    super();
  }

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    // Use `getAuth()` to access `isAuthenticated` and the user's ID
    const { isAuthenticated, userId } = getAuth(request);

    const userCreated = request.body as UserCreatedMinimal;
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
    } = userCreated.data;

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

    // Protect the route from unauthenticated users
    if (!isAuthenticated) {
      return reply
        .code(403)
        .send({ message: "Access denied. Authentication required." });
    }

    // Use `clerkClient` to access Clerk's JS Backend SDK methods
    // const user = await clerkClient.users.getUser(userId);
    const user = await this.service.login(newUser);

    // Only authenticated users will see the following message
    reply.send({ message: "This is a protected route.", user });
  };
}

export { AuthControllerImpl as AuthController };

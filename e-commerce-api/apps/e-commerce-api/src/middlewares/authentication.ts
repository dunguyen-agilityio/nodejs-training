import { UnauthorizedError } from "#types/error";
import { HttpStatus } from "#types/http-status";
import { clerkClient, getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const auth = getAuth(request);

  if (!auth.isAuthenticated) {
    return reply
      .status(HttpStatus.UNAUTHORIZED)
      .send({ message: "Unauthenticated: Please log in." });
  }

  Object.assign(request.auth, auth);
  const userService = request.container.getItem("UserService");
  const user = await userService.getById(auth.userId);

  if (!user) {
    throw new UnauthorizedError();
  }

  if (!user.stripeId) {
    const paymentGateway = request.container.getItem("PaymentGatewayProvider");
    const { email, name } = user;
    const customer = await paymentGateway.createCustomer({ email, name });
    user.stripeId = customer.id;
    await userService.save(user);
  }

  Object.assign(request.auth, { userId: user.id, stripeId: user.stripeId });
};

export const authorizeAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const auth = getAuth(request);
  if (!auth.userId) {
    return reply
      .status(HttpStatus.UNAUTHORIZED)
      .send({ message: "Unauthenticated: Please log in." });
  }

  const response = await clerkClient.users.getOrganizationMembershipList({
    userId: auth.userId,
  });

  const isAdmin = response.data.find(({ role }) => role === "org:admin");

  if (!isAdmin) {
    return reply
      .status(HttpStatus.FORBIDDEN)
      .send({ message: "Access denied: Admin role required." });
  }
};

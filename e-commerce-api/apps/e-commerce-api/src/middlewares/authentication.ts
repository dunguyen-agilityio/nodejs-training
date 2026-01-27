import { HttpStatus } from "#types/http-status";
import { clerkClient, getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const auth = getAuth(request);
  Object.assign(request.auth, auth);

  if (!auth.isAuthenticated) {
    return reply
      .status(HttpStatus.UNAUTHORIZED)
      .send({ message: "Unauthenticated: Please log in." });
  }
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

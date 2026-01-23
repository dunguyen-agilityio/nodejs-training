import { HttpStatus } from "#types/http-status";
import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const auth = getAuth(request);
  request.auth.userId = auth.userId ?? "";

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
  console.log(auth);
  const isAdmin = auth.sessionClaims?.org_role === "org:admin";

  if (!isAdmin) {
    return reply
      .status(HttpStatus.FORBIDDEN)
      .send({ message: "Access denied: Admin role required." });
  }
};

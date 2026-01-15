import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = getAuth(request);
  request.userId = auth.userId ?? "";

  if (!auth.isAuthenticated) {
    return reply
      .status(401)
      .send({ message: "Unauthenticated: Please log in." });
  }
};

export const authorizeAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = getAuth(request);
  const isAdmin = auth.sessionClaims?.org_role === "org:admin";

  if (!isAdmin) {
    return reply
      .status(403)
      .send({ message: "Access denied: Admin role required." });
  }
};

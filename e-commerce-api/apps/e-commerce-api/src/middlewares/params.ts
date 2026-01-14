import { FastifyReply, FastifyRequest } from "fastify";

export const requiredId = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  if (!id) {
    return reply
      .status(400)
      .send({ success: false, error: "Params ID is required" });
  }

  if (isNaN(parseInt(id))) {
    return reply
      .status(400)
      .send({ success: false, error: "Params ID is number" });
  }
};

export const paginationValidate = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  if (!id) {
    return reply
      .status(400)
      .send({ success: false, error: "Params ID is required" });
  }

  if (isNaN(parseInt(id))) {
    return reply
      .status(400)
      .send({ success: false, error: "Params ID is number" });
  }
};

import { FastifyRequest, FastifyReply } from "fastify";

export abstract class AbstractProductController {
  abstract getProducts(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract getProductById(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract addNewProduct(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

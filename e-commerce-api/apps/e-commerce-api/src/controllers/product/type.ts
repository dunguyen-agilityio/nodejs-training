import { FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "../base";
import { ProductService } from "#services/types";

export abstract class AbstractProductController extends BaseController<ProductService> {
  abstract getProducts(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract getProduct(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract addNewProduct(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract deleteProduct(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract updateProduct(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

import { CartService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../base";

export abstract class AbstractCartController extends BaseController<CartService> {
  abstract addProductToCart(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract getCart(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  abstract deleteCart(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

import { Cart } from "#entities";
import { AbstractCartService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../base";

export abstract class AbstractCartController extends BaseController<
  Cart,
  AbstractCartService
> {
  abstract addProductToCart(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
  abstract getCart(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

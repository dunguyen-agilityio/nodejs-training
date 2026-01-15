import { CartItemService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";

import { BaseController } from "../base";

export abstract class AbstractCartItemController extends BaseController<CartItemService> {
  abstract getAll(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  abstract deleteCartItem(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

import { CartItem } from "#entities";
import { AbstractCartItemService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";

import { BaseController } from "../base";

export abstract class AbstractCartItemController extends BaseController<
  CartItem,
  AbstractCartItemService
> {
  abstract getAll(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

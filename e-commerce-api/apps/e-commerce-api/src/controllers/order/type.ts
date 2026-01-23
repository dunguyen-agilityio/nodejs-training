import { OrderService } from "#services/types";
import { FastifyReply, FastifyRequest } from "fastify";

export abstract class AbstractOrderController {
  constructor(protected service: OrderService) {}

  abstract getOrders(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>;
}

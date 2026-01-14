import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCartItemController } from "./type";

export class CartItemController extends AbstractCartItemController {
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {};
}

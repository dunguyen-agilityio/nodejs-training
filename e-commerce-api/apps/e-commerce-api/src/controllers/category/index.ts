import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractCategoryController } from "./type";

export class CategoryController extends AbstractCategoryController {
  getAll = async (_: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const categories = await this.service.getAll();
    reply.send({ success: true, data: categories });
  };
}

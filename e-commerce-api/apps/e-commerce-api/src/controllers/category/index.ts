import { FastifyRequest, FastifyReply } from "fastify";
import { ICategoryController } from "./type";
import { ICategoryService } from "#services/types";

export class CategoryController implements ICategoryController {
  constructor(private service: ICategoryService) { }

  getAll = async (_: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const categories = await this.service.getAll();
    reply.send({ success: true, data: categories });
  };
}

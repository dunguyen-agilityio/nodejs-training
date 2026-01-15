import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../base";
import { CategoryService } from "#services/types";

export abstract class AbstractCategoryController extends BaseController<CategoryService> {
  abstract getAll(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

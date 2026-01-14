import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../base";
import { Category } from "#entities";
import { AbstractCategoryService } from "#services/types";

export abstract class AbstractCategoryController extends BaseController<
  Category,
  AbstractCategoryService
> {
  abstract getAll(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

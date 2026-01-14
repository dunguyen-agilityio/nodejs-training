import { Category } from "#entities";
import { AbstractCategoryRepository } from "../../repositories/category/type";
import { BaseService } from "../base";

export abstract class AbstractCategoryService extends BaseService<
  Category,
  AbstractCategoryRepository
> {
  abstract getAll(): Promise<Category[]>;
}

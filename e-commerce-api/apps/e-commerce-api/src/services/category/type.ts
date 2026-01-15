import { Category } from "#entities";
import { CategoryRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractCategoryService extends BaseService {
  protected categoryRepository: CategoryRepository;

  abstract getAll(): Promise<Category[]>;
}

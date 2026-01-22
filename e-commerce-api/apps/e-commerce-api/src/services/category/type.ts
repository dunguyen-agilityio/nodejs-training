import { Category } from "#entities";
import { CategoryRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractCategoryService extends BaseService {
  protected categoryRepository: CategoryRepository = null!;

  constructor(base: AbstractCategoryService, provider: BaseService) {
    super(base, provider);
    Object.assign(this, base);
  }

  abstract getAll(): Promise<Category[]>;
}

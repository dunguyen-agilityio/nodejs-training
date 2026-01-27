import { Category } from "#entities";
import { CategoryRepository } from "#repositories/types";
import { Dependencies } from "#services/base";
import { ICategoryService } from "./type";

export class CategoryService implements ICategoryService {
  private categoryRepository: CategoryRepository;

  constructor(dependencies: Partial<Dependencies>) {
    Object.assign(this, dependencies);
  }

  async getAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }
}

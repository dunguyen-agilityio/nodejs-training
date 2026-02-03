import { Category } from "#entities";
import { CategoryRepository } from "#repositories/types";
import { ICategoryService } from "./type";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }
}

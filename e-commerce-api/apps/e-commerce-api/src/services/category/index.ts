import { Category } from "#entities";
import { AbstractCategoryService } from "./type";

export class CategoryService extends AbstractCategoryService {
  async getAll(): Promise<Category[]> {
    return this.repository.find();
  }
}

import { Category } from '#entities'

import type { TCategoryRepository } from '#repositories'

import { ICategoryService } from './type'

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: TCategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return await this.categoryRepository.find()
  }
}

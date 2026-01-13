import { Category } from '#entity'

import { AbstractCategoryRepository } from './type'

export class CategoryRepository extends AbstractCategoryRepository {
  getById(id: number): Promise<Category> {
    throw new Error('Method not implemented.')
  }
  getCategories(): Promise<Category[]> {
    throw new Error('Method not implemented.')
  }
}

import { Category } from '#entity'

import { AbstractRepository } from '../base'

export abstract class AbstractCategoryRepository extends AbstractRepository<Category> {
  abstract getById(id: number): Promise<Category>
  abstract getCategories(): Promise<Category[]>
}

import { Category } from '#entities'

export interface ICategoryService {
  getAll(): Promise<Category[]>
}

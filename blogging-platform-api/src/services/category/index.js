import { Repository } from "typeorm";

import { Category } from "#models/category";

export class CategoryService {
  /**
   * @param {Repository<Category>} repository
   */
  constructor(repository) {
    this.categoryRepository = repository;
  }

  /**
   * @returns {Promise<Category[]>}
   */
  async getAll() {
    return await this.categoryRepository.find();
  }
  /**
   * @returns {Promise<Category>}
   * @param {string} name
   */
  async getByName(name) {
    return this.categoryRepository
      .createQueryBuilder("category")
      .where("category.name = :name", { name })
      .getOne();
  }
}

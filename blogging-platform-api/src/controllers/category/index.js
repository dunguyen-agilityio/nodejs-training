import * as Express from "express";

export class CategoryController {
  /**
   *
   * @param {ICategoryService} service
   */
  constructor(service) {
    this.categoryService = service;
  }

  /**
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {Express.NextFunction} next
   */
  GET_ALL = async (req, res, next) => {
    const categories = await this.categoryService.getAll();
    res
      .status(200)
      .json({ meta: { total: categories.length }, data: categories });
  };
}

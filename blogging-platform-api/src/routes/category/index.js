import express from "express";

import { CategoryController } from "#controllers/category";
import { CategoryService } from "#services/category";

/**
 *
 * @param {{categoryService:CategoryService }} param
 */
export const createCategoryRouter = ({ categoryService }) => {
  const router = express.Router();
  const controller = new CategoryController(categoryService);
  router.get("/", controller.GET_ALL);
  return router;
};

export default createCategoryRouter;

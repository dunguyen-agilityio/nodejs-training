import express from "express";

import { PostController } from "#controllers/post";
import {
  postQueryValidation,
  postValidation,
} from "#middlewares/postValidation";
import { idValidation } from "#middlewares/idValigation";

/**
 *
 * @param {{postService:IPostService, categoryService: ICategoryService, tagService: ITagService }} param1
 */
export const createPostRouter = (param1) => {
  const router = express.Router();
  const { postService, categoryService, tagService } = param1;

  const controller = new PostController(
    postService,
    categoryService,
    tagService
  );

  router.get("/", postQueryValidation, controller.GET_ALL);
  router.get("/:id", idValidation, controller.GET);
  router.post("/", postValidation, controller.POST);
  router.put("/:id", idValidation, postValidation, controller.PUT);
  router.delete("/:id", idValidation, controller.DELETE);

  return router;
};

export default createPostRouter;

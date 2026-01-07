import express from "express";

/**
 *
 * @param {{controller: IUserController}} param0
 * @returns
 */
export const createUserRouter = ({ controller }) => {
  const router = express.Router();
  router.get("/me", controller.me);
  return router;
};

export default createUserRouter;

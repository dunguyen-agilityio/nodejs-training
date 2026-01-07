import {
  loginValidation,
  registerValidation,
} from "#middlewares/authValigation";
import express from "express";
import { authenticate } from "#configs/passport";

/**
 *
 * @param {{controller:IUserController }} param
 */
export const createAuthRouter = ({ controller }) => {
  const router = express.Router();

  router.post("/login", loginValidation, controller.login);
  router.delete("/logout", authenticate(), controller.logout);
  router.post("/register", registerValidation, controller.register);

  return router;
};

export default createAuthRouter;

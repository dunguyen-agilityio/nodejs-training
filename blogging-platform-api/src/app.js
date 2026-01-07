import "reflect-metadata";
import { DataSource } from "typeorm";
import createError from "http-errors";
import express from "express";
import path from "node:path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import url from "node:url";
import cors from "cors";

import {
  createAuthRouter,
  createCategoryRouter,
  createHomeRouter,
  createPostRouter,
  createUserRouter,
} from "#routes";
import { CLIENT_ORIGINS } from "#env";
import {
  AuthService,
  CategoryService,
  PostService,
  TagService,
} from "#services";

import {
  tagRepository,
  categoryRepository,
  postRepository,
} from "#repositories";
import { AuthController, UserController } from "#controllers";
import * as passport from "#configs/passport";
import { UserRepository } from "#repositories/user";
import { UserService } from "#services/user";

/**
 *
 * @param {DataSource} db
 * @returns
 */
export const createApp = async (db) => {
  const app = express();

  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

  // Enable CORS for React app
  app.use(
    cors({
      origin: CLIENT_ORIGINS,
      credentials: true,
    })
  );

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jade");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  const tagService = new TagService(tagRepository);

  const categoryService = new CategoryService(categoryRepository);

  const postService = new PostService(
    postRepository,
    categoryService,
    tagService
  );

  const authService = new AuthService(UserRepository);
  const authController = new AuthController(authService);

  const userService = new UserService(UserRepository);
  const userController = new UserController(userService);

  app.use(passport.initialize(userService, authService));

  app.use("/", createHomeRouter());

  app.use(
    "/posts",
    createPostRouter({
      postService,
      categoryService,
      tagService,
    })
  );
  app.use("/categories", createCategoryRouter({ categoryService }));
  app.use("/auth", createAuthRouter({ controller: authController }));

  app.use(
    "/users",
    passport.authenticate(),
    createUserRouter({ controller: userController })
  );

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
};

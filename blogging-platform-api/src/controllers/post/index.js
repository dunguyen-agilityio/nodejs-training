import { PostSchemaStruct } from "#root/schemas/post.js";
import * as Express from "express";
import { Schema } from "effect";

export class PostController {
  /**
   * @param {IPostService} service
   * @param {ICategoryService} categoryService
   * @param {ITagService} tagService
   */
  constructor(service, categoryService, tagService) {
    this.postService = service;
    this.categoryService = categoryService;
    this.tagService = tagService;
  }

  /**
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {Express.NextFunction} next
   */
  GET_ALL = async (req, res, next) => {
    const { term } = req.query;
    const posts = await this.postService.getAll(term);
    res.status(200).json({ meta: { total: posts.length }, data: posts });
  };

  /**
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {Express.NextFunction} next
   */
  GET = async (req, res, next) => {
    const id = parseInt(req.params.id);

    const post = await this.postService.get(id);
    if (!post) {
      return res.status(404).send(`Not Found Post with ID: ${id}`);
    }

    return res.status(200).json(post);
  };

  /**
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {Express.NextFunction} next
   */
  POST = async (req, res, next) => {
    const body = await Schema.decodeUnknownPromise(PostSchemaStruct)(req.body);

    const { category: categoryName, tags } = body;

    const category = await this.categoryService.getByName(categoryName);

    if (!category) {
      const error = {
        message: `Invalid Category: ${categoryName}`,
      };
      return res.status(400).send({ error });
    }

    const post = await this.postService.create({
      ...body,
      category: category,
      tags,
    });

    res.status(201).json(post);
  };

  /**
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {Express.NextFunction} next
   */
  PUT = async (req, res, next) => {
    const id = req.params.id;

    const body = await Schema.decodeUnknownPromise(PostSchemaStruct)(req.body);

    const { category: categoryName } = body;

    const post = await this.postService.get(id);

    if (!post) {
      return res.status(404).send(`Not Found Post with ID: ${id}`);
    }

    const category = await this.categoryService.getByName(categoryName);

    if (!category) {
      const error = {
        message: `Invalid Category: ${categoryName}`,
      };
      return res.status(400).send({ error });
    }

    const updatePost = await this.postService.update(id, {
      ...post,
      ...body,
      category,
    });

    if (!updatePost) {
      return res.status(500);
    }

    res.status(200).json(updatePost);
  };

  /**
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {Express.NextFunction} next
   */
  DELETE = async (req, res, next) => {
    const id = req.params.id;
    const post = await this.postService.get(id);

    if (!post) {
      return res.status(404).send(`Post ID: ${id} does not exist`);
    }
    const success = await this.postService.delete(id);
    if (!success) {
      return res.status(500).send(false);
    }

    res.status(200).send(true);
  };
}

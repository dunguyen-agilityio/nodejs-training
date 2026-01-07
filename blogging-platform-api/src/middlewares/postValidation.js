import { PostQuerySchemaStruct, PostSchemaStruct } from "#root/schemas/post.js";
import { Effect, Schema, ParseResult } from "effect";
import express from "express";

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const postValidation = (req, res, next) => {
  const body = req.body;
  try {
    Schema.decodeUnknownSync(PostSchemaStruct)(body, {
      errors: "all",
      onExcessProperty: "error",
    });

    next();
  } catch (error) {
    if (error instanceof ParseResult.ParseError) {
      return res.status(400).json({
        code: 400,
        message: "Invalid data",
        details: Effect.runSync(ParseResult.ArrayFormatter.formatError(error)),
      });
    }

    res.status(400);
  }
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const postQueryValidation = (req, res, next) => {
  const query = req.query;
  try {
    Schema.decodeUnknownSync(PostQuerySchemaStruct)(query, {
      errors: "all",
      onExcessProperty: "error",
    });

    next();
  } catch (error) {
    if (error instanceof ParseResult.ParseError) {
      return res.status(400).json({
        code: 400,
        message: "Invalid query",
        details: Effect.runSync(ParseResult.ArrayFormatter.formatError(error)),
      });
    }

    res.status(400);
  }
};

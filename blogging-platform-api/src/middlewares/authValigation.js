import { Effect, Schema, ParseResult } from "effect";
import express from "express";

import { UserLoginSchemaStruct, UserRegisterSchemaStruct } from "#schemas/user";

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const loginValidation = (req, res, next) => {
  try {
    Schema.decodeUnknownSync(UserLoginSchemaStruct)(req.body, {
      errors: "all",
      onExcessProperty: "error",
    });

    next();
  } catch (error) {
    let message = "Invalid email or password. Please try again";
    let details = null;

    if (error instanceof ParseResult.ParseError) {
      details = Effect.runSync(
        ParseResult.ArrayFormatter.formatError(error)
      ).filter((item) => ["Missing"].includes(item._tag));

      const firstError = details[0];

      if (firstError && firstError.path.length === 1) {
        message = `Field ${firstError.path[0]} is required`;
      }
    }

    res.status(400).json({
      code: 400,
      message,
      details,
    });
  }
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const registerValidation = (req, res, next) => {
  try {
    Schema.decodeUnknownSync(UserRegisterSchemaStruct)(req.body, {
      errors: "all",
      onExcessProperty: "error",
    });

    next();
  } catch (error) {
    if (error instanceof ParseResult.ParseError) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password. Please try again",
        details: Effect.runSync(ParseResult.ArrayFormatter.formatError(error)),
      });
    }

    res.status(400);
  }
};

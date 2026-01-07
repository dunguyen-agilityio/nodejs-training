import { Effect, Schema, ParseResult } from "effect";
import express from "express";

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const idValidation = (req, res, next) => {
  const id = req.params.id;
  try {
    Schema.decodeUnknownSync(Schema.NumberFromString)(id, {
      errors: "all",
      onExcessProperty: "error",
    });

    next();
  } catch (error) {
    if (error instanceof ParseResult.ParseError) {
      return res.status(400).json({
        code: 400,
        message: "Invalid params",
        details: Effect.runSync(ParseResult.ArrayFormatter.formatError(error)),
      });
    }

    res.status(400);
  }
};

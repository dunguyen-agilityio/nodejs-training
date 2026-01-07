import { Schema } from "effect";
import * as express from "express";

import { UserLoginSchemaStruct, UserRegisterSchemaStruct } from "#schemas/user";
import { User } from "#models/user";

export class AuthController {
  /**
   * @param {IAuthService} service
   */
  constructor(service) {
    this.service = service;
  }

  /**
   *
   * @param {express.Request} request
   * @param {express.Response} response
   * @param {express.NextFunction} next
   */
  login = async (request, response, next) => {
    const { email, password } = await Schema.decodeUnknownPromise(
      UserLoginSchemaStruct
    )(request.body);

    const result = await this.service.login(email, password);

    if (result.success) {
      response.status(200).json(result.data);
    } else {
      response.status(401).json(result.error);
    }
  };

  /**
   *
   * @param {express.Request} request
   * @param {express.Response} response
   * @param {express.NextFunction} next
   */
  register = async (request, response, next) => {
    const { email, password, firstName, lastName, phone } =
      await Schema.decodeUnknownPromise(UserRegisterSchemaStruct)(request.body);

    const result = await this.service.register({
      email,
      firstName,
      lastName,
      password,
      phone,
    });

    if (result.failed) {
      response.status(400).send(result.error);
    } else {
      response.status(201).json({ user: result.data });
    }
  };

  /**
   *
   * @param {express.Request} request
   * @param {express.Response} response
   * @param {express.NextFunction} next
   */
  logout = (request, response, next) => {
    const jwt = request.headers.authorization.split(" ")[1];
    this.service.logout(jwt);
    response.send(true);
  };
}

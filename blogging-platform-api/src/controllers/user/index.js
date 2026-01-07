import * as express from "express";

export class UserController {
  /**
   * @param {IUserService} service
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
  me = async (request, response, next) => {
    response.send(request.user);
  };
}

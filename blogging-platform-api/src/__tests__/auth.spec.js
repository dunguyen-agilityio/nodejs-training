import request from "supertest";
import { createApp } from "../app.js";
import { beforeAll, describe, it, expect, jest, afterAll } from "@jest/globals";
import { DataSource, Repository } from "typeorm";
import { UserSchema } from "#entity/user";
import { MOCK_USERS } from "#mocks/user";
import bcrypt from "bcrypt";
import { AppDataSource } from "#configs/data-source";

const MOCK_TOKEN = "token";

jest.mock("#utils/jwt", () => ({
  gennerateJwt: jest.fn().mockImplementationOnce(() => MOCK_TOKEN),
}));

describe("POST /auth/login", () => {
  /**
   * @type {DataSource}
   */
  let dataSource;
  /**
   * @type {Repository<IUser>}
   */
  let repository;
  /**
   * @type {IUser}
   */
  let newUser;
  /**
   * @type {IUser}
   */
  let MOCK_USER;

  let app;

  beforeAll(async () => {
    app = await createApp();
    dataSource = await AppDataSource.initialize();
    MOCK_USER = { ...MOCK_USERS[0], email: "test1@e2e.com" };

    repository = dataSource.getRepository(UserSchema);
    newUser = await repository.save({
      ...MOCK_USER,
      password: await bcrypt.hash(MOCK_USER.password, await bcrypt.genSalt()),
    });
  });

  afterAll(async () => {
    if (newUser) await repository.delete(newUser.id);
    await dataSource.destroy();
  });

  it("should return correctly response with valid credential", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: MOCK_USER.email, password: MOCK_USER.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("jwt", MOCK_TOKEN);
  });

  it("should return correctly response with invalid credential", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: MOCK_USER.email, password: "invalid" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty(
      "message",
      "Invalid email or password. Please try again"
    );
  });

  it("should return correctly response when missing email credential info", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "invalid" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Field email is required");
  });

  it("should return correctly response when missing password credential info", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: MOCK_USER.email });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Field password is required");
  });
});

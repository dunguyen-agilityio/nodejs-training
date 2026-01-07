import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import bcrypt from "bcrypt";
import { AuthService } from "../index.js";
import { Result } from "#utils/result";
import { MOCK_USERS } from "#mocks/user";

const MOCK_TOKEN = "token";

jest.mock("#utils/jwt", () => ({
  gennerateJwt: jest.fn().mockImplementationOnce(() => MOCK_TOKEN),
}));

describe("AuthService", () => {
  /**
   * @type {IAuthService}
   */
  let service;
  let UserRepository;

  beforeEach(() => {
    UserRepository = {
      getUserById: jest.fn(),
      checkUserExistence: jest.fn(),
      getUserByEmail: jest.fn(),
    };

    service = new AuthService(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("AuthService.login will work correctly with valid email and password", async () => {
    const password = "passw";
    const user = {
      ...MOCK_USERS[0],
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
    };
    UserRepository.getUserByEmail.mockResolvedValueOnce(user);
    const result = await service.login(user.email, password);
    const { password: _, ...rest } = user;
    expect(result).toStrictEqual(new Result({ jwt: MOCK_TOKEN, user: rest }));
  });

  test("AuthService.login will work correctly with invalid password", async () => {
    const password = "passw";
    const user = {
      ...MOCK_USERS[0],
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
    };
    UserRepository.getUserByEmail.mockResolvedValueOnce(user);
    const result = await service.login(user.email, "password_invalid");

    expect(result).toStrictEqual(
      new Result("Invalid email or password. Please try again")
    );
  });

  test("AuthService.login will work correctly with invalid email", async () => {
    const password = "passw";
    const user = {
      ...MOCK_USERS[0],
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
    };
    UserRepository.getUserByEmail.mockResolvedValueOnce(null);
    const result = await service.login(user.email, password);

    expect(result).toStrictEqual(
      new Result("Invalid email or password. Please try again")
    );
  });
});

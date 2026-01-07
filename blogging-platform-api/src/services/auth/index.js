import bcrypt from "bcrypt";

import { Result } from "#utils/result";
import { User } from "#models/user";
import { gennerateJwt } from "#utils/jwt";

/**
 * @implements {IAuthService}
 */
export class AuthService {
  static accessTokens = new Set([]);

  /**
   * @param {IUserRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   *
   * @param {string} email
   * @param {string} password
   * @returns {IUser}
   */
  login = async (email, password) => {
    const user = await this.repository.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Result("Invalid email or password. Please try again");
    }

    const jwt = gennerateJwt({ id: user.id });

    AuthService.accessTokens.add(jwt);

    const data = { user: new User(user).profile, jwt };

    return new Result(data);
  };

  /**
   *
   * @param {UserRegisterPayLoad} body
   * @returns { Promise<Result<IUser>>}
   */
  register = async ({
    firstName,
    lastName,
    password,
    email,
    phone,
    verified,
  }) => {
    const userExists = await this.repository.checkUserExistence(email, phone);

    if (userExists) {
      return new Result("User with this email or phone already exists");
    }

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await this.repository.createUser({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        phone,
        verified,
      });
      return new Result(new User(user).profile);
    } catch {
      return new Result("Can't create new User");
    }
  };

  /**
   *
   * @param {string} jwt
   */
  logout = (jwt) => {
    AuthService.accessTokens.delete(jwt);
  };

  /**
   *
   * @returns {boolean}
   */
  isLogined = (jwt) => {
    return AuthService.accessTokens.has(jwt);
  };
}

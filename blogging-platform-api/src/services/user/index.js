import { User } from "#models/user";
import { Result } from "#utils/result";

export class UserService {
  /**
   *
   * @param {IUserRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<Result<IUser>>;}
   */
  async getUserById(id) {
    try {
      const user = await this.repository.getUserById(id);
      return { data: new User(user).profile, success: true, failed: false };
    } catch (error) {
      return {
        error: { message: error?.message || "Not found User!" },
        failed: true,
      };
    }
  }
}

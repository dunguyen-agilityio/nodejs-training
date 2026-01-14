import { AbstractUserService } from "./type";
import { User } from "#entities";
import { USER_ROLES } from "../../types/user";

export class UserService extends AbstractUserService {
  async addRoleForUser(userId: string, role: USER_ROLES): Promise<boolean> {
    const user = await this.repository.getById(userId);

    if (!user) {
      return false;
    }
    await this.repository.save({ ...user, role });
    return true;
  }

  async getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }
}

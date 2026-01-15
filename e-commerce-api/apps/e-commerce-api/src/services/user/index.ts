import { AbstractUserService } from "./type";
import { USER_ROLES } from "#types/user";

export class UserService extends AbstractUserService {
  async addRoleForUser(userId: string, role: USER_ROLES): Promise<boolean> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      return false;
    }
    await this.userRepository.save({ ...user, role });
    return true;
  }
}

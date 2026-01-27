import { IUserService } from "./type";
import { USER_ROLES } from "#types/user";
import { User } from "#entities";
import { UserRepository } from "#repositories/types";
import { Dependencies } from "#services/base";

export class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor(dependencies: Dependencies) {
    Object.assign(this, dependencies);
  }

  async addRoleForUser(userId: string, role: USER_ROLES): Promise<boolean> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      return false;
    }
    await this.userRepository.save({ ...user, role });
    return true;
  }

  async getUserByStripeId(stripeId: string): Promise<User | null> {
    return this.userRepository.getByStripeId(stripeId);
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}

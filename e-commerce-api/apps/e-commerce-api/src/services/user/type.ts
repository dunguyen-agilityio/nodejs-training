import { User } from "#entities";
import { UserRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractUserService extends BaseService {
  protected userRepository: UserRepository;

  abstract addRoleForUser(userId: string, role: string): Promise<boolean>;
  abstract getUserByStripeId(stripeId: string): Promise<User | null>;
  abstract getById(id: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
}

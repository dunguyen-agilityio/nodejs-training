import { UserRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractUserService extends BaseService {
  protected userRepository: UserRepository;

  abstract addRoleForUser(userId: string, role: string): Promise<boolean>;
}

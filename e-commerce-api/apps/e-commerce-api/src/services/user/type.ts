import { User } from "#entities";
import { AbstractUserRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractUserService extends BaseService<
  User,
  AbstractUserRepository
> {
  abstract getUserById(id: string): Promise<User>;
  abstract addRoleForUser(userId: string, role: string): Promise<boolean>;
}

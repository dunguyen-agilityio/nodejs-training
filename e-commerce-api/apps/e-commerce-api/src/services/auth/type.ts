import { User } from "#entities";
import { AbstractUserRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractAuthService extends BaseService<
  User,
  AbstractUserRepository
> {
  abstract register(body: User): Promise<User>;
}

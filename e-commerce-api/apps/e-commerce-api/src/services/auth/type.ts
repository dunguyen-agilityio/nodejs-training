import { User } from "#entities";
import { BaseService } from "../base";

export abstract class AbstractAuthService extends BaseService<User> {
  abstract register(body: User): Promise<User>;
}

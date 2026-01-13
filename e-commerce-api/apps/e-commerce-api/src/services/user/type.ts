import { User } from "#entities";

export abstract class AbstractUserService {
  abstract getUserById(id: string): Promise<User>;
}

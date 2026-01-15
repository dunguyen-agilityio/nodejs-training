import { User } from "#entities";
import { CartRepository, UserRepository } from "#repositories/types";
import { BaseService } from "../base";

export abstract class AbstractAuthService extends BaseService {
  protected userRepository: UserRepository;
  protected cartRepository: CartRepository;

  abstract register(body: User): Promise<User>;
}

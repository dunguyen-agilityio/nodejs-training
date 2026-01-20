import { User } from "#entities";
import { CartRepository, UserRepository } from "#repositories/types";
import { PaymentGateway } from "#services/types";
import { TRepository } from "#types/container";
import { BaseService } from "../base";

export abstract class AbstractAuthService extends BaseService {
  protected userRepository: UserRepository;
  protected cartRepository: CartRepository;

  constructor(
    repositories: TRepository,
    protected payment: PaymentGateway,
  ) {
    super(repositories);
  }

  abstract register(body: User): Promise<User>;
}

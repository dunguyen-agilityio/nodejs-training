import { User } from "#entities";
import { PaymentGatewayProvider } from "#providers/types";
import { CartRepository, UserRepository } from "#repositories/types";

import { BaseService } from "../base";

export abstract class AbstractAuthService<
  P extends PaymentGatewayProvider = PaymentGatewayProvider,
> extends BaseService<P> {
  protected userRepository: UserRepository = null!;
  protected cartRepository: CartRepository = null!;

  constructor(base: AbstractAuthService<P>, provider: BaseService) {
    super(provider);
    Object.assign(this, base);
  }

  abstract register(body: User): Promise<User>;
}

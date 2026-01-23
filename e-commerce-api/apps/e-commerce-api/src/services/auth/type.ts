import { User } from "#entities";
import { AuthProvider, PaymentGatewayProvider } from "#providers/types";
import { CartRepository, UserRepository } from "#repositories/types";
import { LoginParams } from "#types/auth";

import { Dependencies } from "../base";

export abstract class AbstractAuthService {
  protected userRepository: UserRepository = null!;
  protected cartRepository: CartRepository = null!;
  protected authProvider: AuthProvider = null!;
  protected paymentGatewayProvider: PaymentGatewayProvider = null!;

  constructor(base: Dependencies) {
    Object.assign(this, base);
  }

  abstract register(body: User): Promise<User>;
  abstract login(params: LoginParams): Promise<{ jwt: string; data: User }>;
}

import { User } from "#entities";
import { LoginParams } from "#types/auth";
import { NotFoundError } from "#types/error";
import { AbstractAuthService } from "./type";

export class AuthService extends AbstractAuthService {
  async register(body: User) {
    const { email, firstName, lastName } = body;
    const customer = await this.paymentGatewayProvider.createCustomer({
      email,
      name: `${firstName} ${lastName}`,
    });
    const user = await this.userRepository.save({
      ...body,
      stripeId: customer.id,
    });
    await this.cartRepository.save({
      user,
      status: "active",
      items: [],
    });
    return user;
  }

  async login({
    identifier,
    password,
  }: LoginParams): Promise<{ jwt: string; data: User }> {
    const user = await this.userRepository.findOneBy({ email: identifier });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const jwt = await this.authProvider.login(user.id, password);

    return { jwt, data: user };
  }
}

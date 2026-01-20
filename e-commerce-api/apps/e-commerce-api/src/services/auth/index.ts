import { User } from "#entities";
import { AbstractAuthService } from "./type";

export class AuthService extends AbstractAuthService {
  async register(body: User) {
    const { email, firstName, lastName } = body;
    const customer = await this.payment.createCustomer({
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
}

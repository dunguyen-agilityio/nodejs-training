import { User } from "#entities";
import { PaymentService } from "#services/stripe/type";
import { AbstractAuthService } from "./type";

export class AuthService extends AbstractAuthService {
  async register(body: User, payment: PaymentService) {
    const { email, firstName, lastName } = body;
    const customer = await payment.createCustomer({
      email,
      name: `${firstName} ${lastName}`,
    });
    const user = await this.userRepository.save({
      ...body,
      stripeId: customer.id,
    });
    await this.cartRepository.save({
      userId: user.id,
    });
    return user;
  }
}

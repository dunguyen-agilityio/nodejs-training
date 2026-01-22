import { User } from "#entities";
import { StripePaymentGatewayProvider } from "#providers";
import { AbstractAuthService } from "./type";

export class AuthService extends AbstractAuthService<StripePaymentGatewayProvider> {
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
}

import { User } from "#entities";
import { CartRepository, UserRepository } from "#repositories/types";
import { Dependencies } from "#services/base";
import { LoginParams } from "#types/auth";
import { NotFoundError } from "#types/error";
import { IAuthService } from "./type";
import { IMailProvider, IPaymentGatewayProvider } from "#providers/types";

export class AuthService implements IAuthService {
  private userRepository: UserRepository;
  private cartRepository: CartRepository;
  private paymentGatewayProvider: IPaymentGatewayProvider;
  private mailProvider: IMailProvider;

  constructor(dependecies: Dependencies) {
    Object.assign(this, dependecies);
  }

  async register(body: User) {
    const {
      email,
      name,
      avatar,
      firstName,
      lastName,
      username,
      phone,
      age,
      role,
      id,
    } = body;
    const customer = await this.paymentGatewayProvider.findOrCreateCustomer({
      email,
      name,
    });
    const user = await this.userRepository.save({
      avatar,
      firstName,
      lastName,
      username,
      phone,
      stripeId: customer.id,
      age,
      role,
      id,
      email,
    });
    await this.cartRepository.save({
      user,
      status: "active",
      items: [],
    });

    const loginPath = `${process.env.CLIENT_BASE_URL}${process.env.CLIENT_LOGIN_PATH}`;

    await this.mailProvider.sendWithTemplate({
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: process.env.SENDGRID_TEMPLATE_REGISTER_SUCCESS!,
      to: email,
      dynamicTemplateData: {
        name,
        email,
        app_name: process.env.APP_NAME,
        logo_url: process.env.APP_LOGO_URL,
        login_url: loginPath,
        support_email: process.env.SENDGRID_SUPPORT_EMAIL,
        year: process.env.APP_YEAR,
      },
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

    // const jwt = await this.authProvider.login(user.id, password);

    return { jwt: "jwt", data: user };
  }
}

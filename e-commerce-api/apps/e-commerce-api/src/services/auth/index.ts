import { User } from '#entities'
import {
  EmailProvider,
  LoginParams,
  NotFoundError,
  PaymentGateway,
} from '#types'

import type { TCartRepository, TUserRepository } from '#repositories'

import env from '#env'
import { IAuthService } from './type'

export class AuthService implements IAuthService {
  constructor(
    private userRepository: TUserRepository,
    private cartRepository: TCartRepository,
    private paymentGatewayProvider: PaymentGateway,
    private mailProvider: EmailProvider,
  ) {}

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
    } = body
    const customer = await this.paymentGatewayProvider.findOrCreateCustomer({
      email,
      name,
    })
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
    })
    await this.cartRepository.save({
      user,
      status: 'active',
      items: [],
    })

    const loginPath = `${env.client.baseUrl}${env.client.loginPath}`

    await this.mailProvider.sendWithTemplate({
      from: env.sendgrid.fromEmail,
      templateId: env.sendgrid.templates.registerSuccess,
      to: email,
      dynamicTemplateData: {
        name,
        email,
        app_name: env.app.name,
        logo_url: env.app.logoUrl,
        login_url: loginPath,
        support_email: env.sendgrid.supportEmail,
        year: env.app.year,
      },
    })
    return user
  }

  async login({
    identifier,
  }: LoginParams): Promise<{ jwt: string; data: User }> {
    const user = await this.userRepository.findOneBy({ email: identifier })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    // const jwt = await this.authProvider.login(user.id, password);

    return { jwt: 'jwt', data: user }
  }
}

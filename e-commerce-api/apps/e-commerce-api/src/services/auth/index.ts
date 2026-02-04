import { FastifyBaseLogger } from 'fastify'

import env from '#env'

import type { TCartRepository, TUserRepository } from '#repositories'

import { EmailProvider, PaymentGateway } from '#types'

import { User } from '#entities'

import { IAuthService } from './type'

export class AuthService implements IAuthService {
  constructor(
    private userRepository: TUserRepository,
    private cartRepository: TCartRepository,
    private paymentGatewayProvider: PaymentGateway,
    private mailProvider: EmailProvider,
    private logger: FastifyBaseLogger,
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

    this.logger.info({ email, name }, 'Registering new user')

    try {
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

      this.logger.debug({ userId: user.id }, 'Cart created for user')

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

      this.logger.info(
        { userId: user.id, email },
        'User registered successfully, confirmation email sent',
      )
      return user
    } catch (error) {
      this.logger.error({ email, error }, 'Error during user registration')
      throw error
    }
  }
}

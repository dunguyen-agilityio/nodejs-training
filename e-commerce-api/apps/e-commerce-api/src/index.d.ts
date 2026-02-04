import type { MailService } from '@sendgrid/mail'
import type { Stripe } from 'stripe'

import type { USER_ROLES } from '#types/user'

import type { TContainer } from './utils/container'

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyRequest {
    container: TContainer
    auth: { userId: string; orgRole: string; stripeId: string }
  }
  interface FastifyReply {}

  interface FastifyInstance {
    container: TContainer
    stripe: Stripe
    sendgrid: MailService
  }
}

declare module '@clerk/fastify' {
  interface UserJSON {
    role: USER_ROLES
  }
}

import { FastifyPluginCallback } from 'fastify'

import { validateRequest } from '#middlewares'

import { AuthErrorResponseSchema, RegisterResponseSchema } from '#schemas/auth'
import { loginBodySchema, registerBodySchema } from '#schemas/auth.schema'

export const authRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.authController

  instance.post(
    '/webhooks',
    {
      schema: {
        summary: 'Register User Webhook',
        description:
          'Webhook endpoint for Clerk to register a new user in the database.',
        tags: ['auth'],
        body: registerBodySchema,
        response: {
          201: RegisterResponseSchema,
          400: AuthErrorResponseSchema,
          500: AuthErrorResponseSchema,
        },
      },
      attachValidation: true,
      preHandler: [validateRequest],
    },
    controller.register,
  )

  instance.post(
    '/login',
    {
      schema: {
        summary: 'Login User',
        description:
          'Authenticate user using identifier (email/username) and password via Clerk.',
        tags: ['auth'],
        body: loginBodySchema,
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            additionalProperties: true,
          },
          400: AuthErrorResponseSchema,
          500: AuthErrorResponseSchema,
        },
      },
      attachValidation: true,
    },
    controller.login,
  )

  done()
}

import { FastifyPluginCallback } from 'fastify'

import { validateRequest } from '#middlewares'

import { HttpStatus } from '#types/http-status'

import { AuthErrorResponseSchema, RegisterResponseSchema } from '#schemas/auth'
import { loginBodySchema, registerBodySchema } from '#schemas/auth.schema'

export const authRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.authController

  instance.post(
    '/register',
    {
      schema: {
        summary: 'Register User Webhook',
        description:
          'Webhook endpoint for Clerk to register a new user in the database.',
        tags: ['auth'],
        body: registerBodySchema,
        response: {
          [HttpStatus.CREATED]: RegisterResponseSchema,
          [HttpStatus.BAD_REQUEST]: AuthErrorResponseSchema,
          [HttpStatus.INTERNAL_SERVER_ERROR]: AuthErrorResponseSchema,
          [HttpStatus.TOO_MANY_REQUESTS]: AuthErrorResponseSchema,
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
          [HttpStatus.OK]: {
            description: 'Login successful',
            type: 'object',
            additionalProperties: true,
          },
          [HttpStatus.BAD_REQUEST]: AuthErrorResponseSchema,
          [HttpStatus.INTERNAL_SERVER_ERROR]: AuthErrorResponseSchema,
          [HttpStatus.TOO_MANY_REQUESTS]: AuthErrorResponseSchema,
        },
      },
      attachValidation: true,
    },
    controller.login,
  )

  done()
}

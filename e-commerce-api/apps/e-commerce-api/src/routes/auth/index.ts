import { FastifyPluginCallback } from 'fastify'

import { validateRequest } from '#middlewares'

import { registerBodySchema } from '#schemas/auth.schema'

export const authRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.authController

  instance.post(
    '/webhooks',
    {
      schema: { body: registerBodySchema },
      attachValidation: true,
      preHandler: [validateRequest],
    },
    controller.register,
  )

  done()
}

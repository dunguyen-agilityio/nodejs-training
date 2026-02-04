import { FastifyPluginCallback } from 'fastify'

import { authenticate, authorizeAdmin } from '#middlewares'

export const metricRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.metricController

  instance.get(
    '/product',
    {
      preHandler: [authenticate, authorizeAdmin],
    },
    controller.getProductMetrics,
  )

  done()
}

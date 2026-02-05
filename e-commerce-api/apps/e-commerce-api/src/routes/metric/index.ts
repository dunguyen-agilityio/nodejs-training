import { FastifyPluginCallback } from 'fastify'

import { authenticate, authorizeAdmin } from '#middlewares'

import { MetricErrorResponseSchema, ProductMetricSchema } from '#schemas/metric'

export const metricRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.metricController

  instance.get(
    '/product',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: {
        description: 'Admin: product dashboard metrics',
        tags: ['admin', 'metrics'],
        security: [{ bearerAuth: [] }],
        response: {
          200: ProductMetricSchema,
          401: MetricErrorResponseSchema,
          403: MetricErrorResponseSchema,
          500: MetricErrorResponseSchema,
        },
      },
    },
    controller.getProductMetrics,
  )

  done()
}

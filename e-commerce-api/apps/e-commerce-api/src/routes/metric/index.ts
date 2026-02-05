import { FastifyPluginCallback } from 'fastify'

import { authenticate, authorizeAdmin } from '#middlewares'

import { HttpStatus } from '#types/http-status'

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
          [HttpStatus.OK]: ProductMetricSchema,
          [HttpStatus.UNAUTHORIZED]: MetricErrorResponseSchema,
          [HttpStatus.FORBIDDEN]: MetricErrorResponseSchema,
          [HttpStatus.INTERNAL_SERVER_ERROR]: MetricErrorResponseSchema,
          [HttpStatus.TOO_MANY_REQUESTS]: MetricErrorResponseSchema,
        },
      },
    },
    controller.getProductMetrics,
  )

  done()
}

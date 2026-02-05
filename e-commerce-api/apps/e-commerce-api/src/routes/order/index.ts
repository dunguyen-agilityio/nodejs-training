import { FastifyPluginCallback } from 'fastify'

import { authenticate } from '#middlewares'

import { getOrdersSchema } from '#schemas/order'
import {
  OrderErrorResponseSchema,
  OrdersPaginatedResponseSchema,
} from '#schemas/order-response'

export const orderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.orderController

  instance.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: "Get current user's orders (paginated)",
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        querystring: getOrdersSchema,
        response: {
          200: OrdersPaginatedResponseSchema,
          401: OrderErrorResponseSchema,
          500: OrderErrorResponseSchema,
        },
      },
    },
    controller.getOrders,
  )

  done()
}

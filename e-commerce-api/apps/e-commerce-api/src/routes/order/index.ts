import { FastifyPluginCallback } from 'fastify'

import { HttpStatus } from '#types/http-status'

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
      preHandler: [instance.authenticate],
      schema: {
        description: "Get current user's orders (paginated)",
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        querystring: getOrdersSchema,
        response: {
          [HttpStatus.OK]: OrdersPaginatedResponseSchema,
          [HttpStatus.UNAUTHORIZED]: OrderErrorResponseSchema,
          [HttpStatus.INTERNAL_SERVER_ERROR]: OrderErrorResponseSchema,
          [HttpStatus.TOO_MANY_REQUESTS]: OrderErrorResponseSchema,
        },
      },
    },
    controller.getOrders,
  )

  done()
}

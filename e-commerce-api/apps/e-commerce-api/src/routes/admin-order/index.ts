import { FastifyPluginCallback } from 'fastify'

import { authenticate, authorizeAdmin } from '#middlewares'

import { updateOrderStatusSchema } from '#schemas/admin-order'
import { getOrdersSchema } from '#schemas/order'
import {
  OrderSchema,
  OrdersPaginatedResponseSchema,
} from '#schemas/order-response'
import { ErrorResponseSchema } from '#schemas/response'

export const adminOrderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.adminOrderController

  instance.get(
    '/',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: {
        description: 'Admin: get all orders (paginated)',
        tags: ['admin', 'orders'],
        security: [{ bearerAuth: [] }],
        querystring: getOrdersSchema,
        response: {
          200: OrdersPaginatedResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    controller.getAllOrders,
  )

  instance.patch(
    '/:id/status',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: {
        description: 'Admin: update order status',
        tags: ['admin', 'orders'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Order id (number as string)' },
          },
        },
        body: updateOrderStatusSchema,
        response: {
          200: OrderSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    controller.updateOrderStatus,
  )

  done()
}

import { FastifyPluginCallback } from 'fastify'

import { authenticate, authorizeAdmin } from '#middlewares'

import { updateOrderStatusSchema } from '#schemas/admin-order'
import { getOrdersSchema } from '#schemas/order'

export const adminOrderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.adminOrderController

  instance.get(
    '/',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: { querystring: getOrdersSchema },
    },
    controller.getAllOrders,
  )

  instance.patch(
    '/:id/status',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: { body: updateOrderStatusSchema },
    },
    controller.updateOrderStatus,
  )

  done()
}

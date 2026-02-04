import { FastifyPluginCallback } from 'fastify'

import { authenticate } from '#middlewares'

import { getOrdersSchema } from '#schemas/order'

export const orderRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.controllers.orderController

  instance.get(
    '/',
    {
      preHandler: [authenticate],
      schema: { querystring: getOrdersSchema },
    },
    controller.getOrders,
  )

  done()
}

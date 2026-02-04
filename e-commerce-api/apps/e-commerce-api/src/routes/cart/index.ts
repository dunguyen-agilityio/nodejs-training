import { FastifyPluginCallback } from 'fastify'

import { authenticate } from '#middlewares'

export const cartRoutes: FastifyPluginCallback = (instance, _, done) => {
  const { cartController, cartItemController } = instance.container.controllers

  instance.post(
    '/add',
    { preHandler: [authenticate] },
    cartController.addProductToCart,
  )
  instance.get('/', { preHandler: [authenticate] }, cartController.getCart)
  instance.delete(
    '/items/:id',
    { preHandler: [authenticate] },
    cartItemController.deleteCartItem,
  )
  instance.put(
    '/items/:id',
    { preHandler: [authenticate] },
    cartItemController.updateCartItemQuantity,
  )
  done()
}

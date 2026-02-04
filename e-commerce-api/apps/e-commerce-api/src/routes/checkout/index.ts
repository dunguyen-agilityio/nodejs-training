import { FastifyPluginCallback } from 'fastify'

import { authenticate, validateRequest } from '#middlewares'

import { paymentSuccessSchema } from '#schemas/checkout'

const createPaymentIntentSchema = {
  body: {
    type: 'object',
    required: ['currency'],
    properties: {
      currency: { type: 'string', pattern: '^[a-z]{3}$', default: 'usd' },
    },
  },
}

export const checkoutRoutes: FastifyPluginCallback = (
  instance,
  _opts,
  done,
) => {
  const container = instance.container.controllers.checkoutController
  instance.post(
    '/payment-intents',
    { schema: createPaymentIntentSchema, preHandler: [authenticate] },
    container.createPaymentIntentHandler,
  )
  instance.post(
    '/orders/prepare',
    { preHandler: [authenticate] },
    container.prepareOrderHandler,
  )
  instance.post(
    '/stripe-webhooks',
    {
      preHandler: [validateRequest],
      schema: { body: paymentSuccessSchema },
    },
    container.stripeWebhookHandler,
  )
  done()
}

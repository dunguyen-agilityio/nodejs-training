import { FastifyPluginCallback } from 'fastify'

import { authenticate, validateRequest } from '#middlewares'

import {
  createPaymentIntentSchema,
  paymentSuccessSchema,
} from '#schemas/checkout'
import {
  CheckoutErrorResponseSchema,
  PaymentIntentResponseSchema,
  StripeWebhookAckSchema,
} from '#schemas/checkout-response'

export const checkoutRoutes: FastifyPluginCallback = (
  instance,
  _opts,
  done,
) => {
  const container = instance.container.controllers.checkoutController
  instance.post(
    '/payment-intents',
    {
      schema: {
        description: 'Create Stripe payment intent',
        tags: ['checkout'],
        security: [{ bearerAuth: [] }],
        body: createPaymentIntentSchema,
        response: {
          200: PaymentIntentResponseSchema,
          400: CheckoutErrorResponseSchema,
          401: CheckoutErrorResponseSchema,
          500: CheckoutErrorResponseSchema,
        },
      },
      preHandler: [authenticate],
    },
    container.createPaymentIntentHandler,
  )
  instance.post(
    '/orders/prepare',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Prepare order for payment',
        tags: ['checkout'],
        security: [{ bearerAuth: [] }],
        response: {
          204: { type: 'null' },
          401: CheckoutErrorResponseSchema,
          500: CheckoutErrorResponseSchema,
        },
      },
    },
    container.prepareOrderHandler,
  )
  instance.post(
    '/stripe-webhooks',
    {
      preHandler: [validateRequest],
      schema: {
        description: 'Stripe webhook (invoice.payment_succeeded)',
        tags: ['checkout'],
        body: paymentSuccessSchema,
        response: {
          200: StripeWebhookAckSchema,
          400: CheckoutErrorResponseSchema,
          500: CheckoutErrorResponseSchema,
        },
      },
    },
    container.stripeWebhookHandler,
  )
  done()
}

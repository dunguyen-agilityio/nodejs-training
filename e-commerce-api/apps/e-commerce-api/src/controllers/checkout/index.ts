import { FastifyReply, FastifyRequest } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import { ICheckoutService } from '#services/types'

import { UnexpectedError } from '#types'

import {
  createPaymentIntentSchema,
  paymentSuccessSchema,
} from '#schemas/checkout'

import { ICheckoutController } from './type'

export class CheckoutController implements ICheckoutController {
  constructor(private service: ICheckoutService) {}

  createPaymentIntentHandler = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof createPaymentIntentSchema>
    }>,
    reply: FastifyReply,
  ) => {
    const { amount, currency } = request.body
    const { stripeId, userId } = request.auth

    const invoice = await this.service.generatePaymentIntent(
      { amount, currency },
      userId,
      stripeId,
    )

    const { confirmation_secret } = invoice

    if (!confirmation_secret) {
      throw new UnexpectedError()
    }

    const { client_secret } = confirmation_secret
    reply.send({ clientSecret: client_secret })
  }

  /**
   * @description Prepares an order for checkout. This is a prerequisite step before confirming the payment.
   * @param request
   * @param reply
   */
  prepareOrderHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { stripeId, userId } = request.auth
    await this.service.prepareOrderForPayment(userId, stripeId)
    reply.status(204).send()
  }

  stripeWebhookHandler = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof paymentSuccessSchema>
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { data, type } = request.body

    if (type === 'invoice.payment_succeeded') {
      const { id: invoiceId, customer } = data.object
      await this.service.handleSuccessfulPayment(customer, invoiceId)
    }

    reply.send({ received: true })
  }
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import { ICheckoutService } from '#services/types'

import { UnexpectedError } from '#types'

import {
  createPaymentIntentSchema,
  paymentSuccessSchema,
} from '#schemas/checkout'

import { BaseController } from '../base'
import { ICheckoutController } from './type'

export class CheckoutController
  extends BaseController
  implements ICheckoutController
{
  constructor(private service: ICheckoutService) {
    super()
  }

  createPaymentIntentHandler = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof createPaymentIntentSchema>
    }>,
    reply: FastifyReply,
  ) => {
    const { currency } = request.body
    const { stripeId, userId } = request.auth

    const invoice = await this.service.generatePaymentIntent(
      { currency },
      userId,
      stripeId,
    )

    const { confirmation_secret } = invoice

    if (!confirmation_secret) {
      throw new UnexpectedError()
    }

    const { client_secret } = confirmation_secret
    this.sendItem(reply, {
      clientSecret: client_secret,
    })
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
    this.sendNoContent(reply)
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

    this.sendItem(reply, { received: true })
  }
}

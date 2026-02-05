import { ErrorResponseSchema } from './response'

export const PaymentIntentResponseSchema = {
  type: 'object',
  properties: {
    clientSecret: { type: 'string', example: 'pi_123_secret_abc' },
  },
  required: ['clientSecret'],
  additionalProperties: false,
} as const

export const StripeWebhookAckSchema = {
  type: 'object',
  properties: {
    received: { type: 'boolean', example: true },
  },
  required: ['received'],
  additionalProperties: false,
} as const

export const CheckoutErrorResponseSchema = ErrorResponseSchema

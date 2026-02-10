import { ErrorResponseSchema } from './response'

export const PaymentIntentResponseSchema = {
  type: 'object',
  properties: {
    clientSecret: { type: 'string', example: 'pi_123_secret_abc' },
    orderId: { type: 'number', example: 1 },
    status: { type: 'string', example: 'pending' },
    total: { type: 'number', example: 100 },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', example: 'prod_123' },
          productName: { type: 'string', example: 'Product Name' },
          productPrice: { type: 'number', example: 100 },
          quantity: { type: 'number', example: 1 },
        },
      },
    },
  },
  required: ['clientSecret', 'orderId'],
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

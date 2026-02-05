import { ErrorResponseSchema, createPaginatedResponseSchema } from './response'

export const OrderSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 123 },
    userId: { type: ['string', 'null'], example: 'user_123' },
    status: {
      type: 'string',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      example: 'pending',
    },
    items: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', example: 'prod_123' },
          quantity: { type: 'number', example: 2 },
          price: { type: 'number', example: 49.99 },
          name: { type: 'string', example: 'Laptop' },
          image: {
            type: ['string', 'null'],
            example: 'https://example.com/i.png',
          },
          description: { type: 'string', example: 'High-performance laptop' },
        },
        required: ['productId', 'quantity', 'price', 'name'],
        additionalProperties: true,
      },
    },
    total: { type: 'number', example: 99.98 },
    date: { type: 'string', format: 'date-time' },
    shippingAddress: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' },
        country: { type: 'string' },
      },
      required: ['name', 'address', 'city', 'zipCode', 'country'],
      additionalProperties: false,
    },
  },
  required: ['id', 'status', 'total', 'date', 'shippingAddress'],
  additionalProperties: true,
} as const

export const OrdersPaginatedResponseSchema =
  createPaginatedResponseSchema(OrderSchema)

export const OrderErrorResponseSchema = ErrorResponseSchema

export const UserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'user_123' },
    username: { type: ['string', 'null'], example: 'john_doe' },
    firstName: { type: 'string', example: 'John' },
    lastName: { type: ['string', 'null'], example: 'Doe' },
    age: { type: ['number', 'null'], example: 25 },
    email: { type: 'string', format: 'email', example: 'john@example.com' },
    phone: { type: ['string', 'null'], example: '+1234567890' },
    avatar: { type: ['string', 'null'], example: 'https://example.com/a.png' },
    stripeId: { type: ['string', 'null'], example: 'cus_123' },
    role: { type: ['string', 'null'], example: 'USER' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'firstName', 'email', 'createdAt', 'updatedAt'],
  additionalProperties: true,
} as const

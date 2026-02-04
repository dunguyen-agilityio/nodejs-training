export const getOrdersSchema = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1 },
    pageSize: { type: 'number', default: 10 },
  },
  required: [],
} as const

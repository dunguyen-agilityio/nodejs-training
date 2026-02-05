export const getOrdersSchema = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1 },
    pageSize: { type: 'number', default: 10 },
    status: { type: 'string' },
    date: { type: 'string' },
  },
  required: [],
} as const

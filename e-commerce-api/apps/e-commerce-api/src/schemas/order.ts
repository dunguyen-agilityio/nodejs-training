export const getOrdersSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', },
        pageSize: { type: 'string', },
    },
    required: ['page', 'pageSize'],
} as const;
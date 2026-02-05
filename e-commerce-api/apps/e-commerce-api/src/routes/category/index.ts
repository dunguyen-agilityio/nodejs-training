import { FastifyPluginCallback } from 'fastify'

import {
  CategoryErrorResponseSchema,
  CategoryListResponseSchema,
} from '#schemas/category'

export const categoryRoutes: FastifyPluginCallback = (instance, _, done) => {
  const { categoryController } = instance.container.controllers
  instance.get(
    '/',
    {
      schema: {
        description: 'Get all categories',
        tags: ['categories'],
        response: {
          200: CategoryListResponseSchema,
          500: CategoryErrorResponseSchema,
        },
      },
    },
    categoryController.getAll,
  )
  done()
}

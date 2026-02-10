import { FastifyPluginCallback } from 'fastify'

import { HttpStatus } from '#types/http-status'

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
          [HttpStatus.OK]: CategoryListResponseSchema,
          [HttpStatus.INTERNAL_SERVER_ERROR]: CategoryErrorResponseSchema,
          [HttpStatus.TOO_MANY_REQUESTS]: CategoryErrorResponseSchema,
        },
      },
    },
    categoryController.getAll,
  )
  done()
}

import { FastifyPluginCallback } from 'fastify'

import { authenticate, authorizeAdmin, requiredId } from '#middlewares'

import { PaginationSchema } from '#schemas/pagination'
import {
  ProductDetailResponseSchema,
  ProductErrorResponseSchema,
  ProductListResponseSchema,
} from '#schemas/product'

export const productRoutes: FastifyPluginCallback = (instance, _, done) => {
  const { productController } = instance.container.controllers
  instance.get(
    '/',
    {
      schema: {
        description: 'Get paginated list of products',
        tags: ['products'],
        querystring: {
          type: 'object',
          properties: {
            ...PaginationSchema.properties,
            query: {
              type: 'string',
              description: 'Search query',
            },
            category: {
              type: 'string',
              description: 'Filter by category (comma-separated)',
            },
          },
        },
        response: {
          200: ProductListResponseSchema,
          400: ProductErrorResponseSchema,
          500: ProductErrorResponseSchema,
        },
      },
    },
    productController.getProducts,
  )
  instance.get(
    '/:id',
    {
      preHandler: [requiredId],
      schema: {
        description: 'Get a single product by ID',
        tags: ['products'],
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['id'],
        },
        response: {
          200: ProductDetailResponseSchema,
          404: ProductErrorResponseSchema,
          500: ProductErrorResponseSchema,
        },
      },
    },
    productController.getProduct,
  )

  instance.register(productAdminRoutes)
  instance.register(productAdminRoutes, { prefix: '/admin' })

  done()
}

const productAdminRoutes: FastifyPluginCallback = (instance, _, done) => {
  instance.addHook('preHandler', authenticate)
  instance.addHook('preHandler', authorizeAdmin)

  const { productController } = instance.container.controllers

  instance.post(
    '/',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: {
        description: 'Create a new product (Admin only)',
        tags: ['products', 'admin'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock', 'category'],
          properties: {
            name: {
              type: 'string',
              description: 'Product name',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            stock: {
              type: 'integer',
              description: 'Stock quantity',
            },
            category: {
              type: 'string',
              description: 'Category name',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Product images URLs',
            },
          },
        },
        response: {
          201: ProductDetailResponseSchema,
          400: ProductErrorResponseSchema,
          401: ProductErrorResponseSchema,
          403: ProductErrorResponseSchema,
          500: ProductErrorResponseSchema,
        },
      },
    },
    productController.addNewProduct,
  )

  instance.put(
    '/:id',
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: {
        description: 'Update a product (Admin only)',
        tags: ['products', 'admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'integer' },
            category: { type: 'string' },
            images: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        response: {
          200: ProductDetailResponseSchema,
          400: ProductErrorResponseSchema,
          401: ProductErrorResponseSchema,
          403: ProductErrorResponseSchema,
          404: ProductErrorResponseSchema,
          500: ProductErrorResponseSchema,
        },
      },
    },
    productController.updateProduct,
  )

  instance.delete(
    '/:id',
    {
      preHandler: [requiredId],
      schema: {
        description: 'Delete a product (Admin only)',
        tags: ['products', 'admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['id'],
        },
        response: {
          204: {
            type: 'null',
            description: 'Product deleted successfully',
          },
          401: ProductErrorResponseSchema,
          403: ProductErrorResponseSchema,
          404: ProductErrorResponseSchema,
          500: ProductErrorResponseSchema,
        },
      },
    },
    productController.deleteProduct,
  )

  done()
}

import { FastifyPluginCallback } from 'fastify'

import { authenticate } from '#middlewares'

import {
  CartItemSchema,
  CartItemUpdatedSchema,
  CartSchema,
} from '#schemas/cart'
import { ErrorResponseSchema } from '#schemas/response'

export const cartRoutes: FastifyPluginCallback = (instance, _, done) => {
  const { cartController, cartItemController } = instance.container.controllers

  instance.post(
    '/add',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Add product to cart (create/update cart item)',
        tags: ['cart'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string' },
            quantity: { type: 'number', minimum: 0 },
          },
          examples: [
            { productId: 'prod_123', quantity: 2 },
            { productId: 'prod_123', quantity: 0 },
          ],
        },
        response: {
          201: CartItemSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    cartController.addProductToCart,
  )
  instance.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: "Get current user's cart",
        tags: ['cart'],
        security: [{ bearerAuth: [] }],
        response: {
          200: CartSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    cartController.getCart,
  )
  instance.delete(
    '/items/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Delete a cart item',
        tags: ['cart'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              description: 'Cart item id (number as string)',
            },
          },
        },
        response: {
          204: { type: 'null' },
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    cartItemController.deleteCartItem,
  )
  instance.put(
    '/items/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Update cart item quantity',
        tags: ['cart'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              description: 'Cart item id (number as string)',
            },
          },
        },
        body: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: { type: 'string', description: 'Quantity as string' },
          },
          examples: [{ quantity: '3' }],
        },
        response: {
          200: CartItemUpdatedSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    cartItemController.updateCartItemQuantity,
  )
  done()
}

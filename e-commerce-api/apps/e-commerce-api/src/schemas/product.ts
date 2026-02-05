import { ErrorResponseSchema, createPaginatedResponseSchema } from './response'

export const ProductSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'Product ID',
      example: 'prod_123456',
    },
    name: {
      type: 'string',
      description: 'Product name',
      example: 'Laptop',
    },
    description: {
      type: 'string',
      description: 'Product description',
      example: 'High-performance laptop for professionals',
    },
    price: {
      type: 'number',
      description: 'Product price',
      example: 999.99,
    },
    stock: {
      type: 'integer',
      description: 'Available stock quantity',
      example: 50,
    },
    images: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Product images URLs',
      example: ['https://example.com/image1.jpg'],
    },
    image: {
      type: 'string',
      description: 'Product image URL',
      example: 'https://example.com/image1.jpg',
    },
    category: {
      type: 'string',
      description: 'Category name',
      example: 'Electronics',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Creation timestamp',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
    },
  },
  required: ['id', 'name', 'description', 'price', 'stock', 'category'],
} as const

export const ProductListResponseSchema =
  createPaginatedResponseSchema(ProductSchema)

export const ProductDetailResponseSchema = ProductSchema

export const ProductCreateResponseSchema = ProductSchema

export const ProductUpdateResponseSchema = ProductSchema

export const ProductErrorResponseSchema = ErrorResponseSchema

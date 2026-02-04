import { FastifyReply, FastifyRequest } from 'fastify'

import { IProductService } from '#services/types'

import { HttpStatus } from '#types'

import { productToObject } from '#dtos/product'

import { Product } from '#entities'

import { IProductController } from './type'

type ProductQuery = {
  page: string
  pageSize: string
  query: string
  category: string
}

export class ProductController implements IProductController {
  constructor(private service: IProductService) {}

  updateProduct = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: Partial<
        Pick<
          Product,
          'category' | 'description' | 'images' | 'name' | 'price' | 'stock'
        >
      >
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = request.params
    const body = request.body

    const product = await this.service.updateProduct(id, body)

    reply.code(HttpStatus.OK).send(product)
  }

  addNewProduct = async (
    request: FastifyRequest<{ Body: Omit<Product, 'id'> }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const productData = request.body
    const newProduct = await this.service.saveProduct(productData)
    reply.status(HttpStatus.CREATED).send({ success: true, data: newProduct })
  }

  getProducts = async (
    request: FastifyRequest<{
      Querystring: ProductQuery
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { page = '1', pageSize = '10', query = '', category } = request.query
    const { data, meta } = await this.service.getProducts({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      query,
      categories: category?.split(',') || [],
    })
    reply.send({
      success: true,
      data: data.map(productToObject),
      meta,
    })
  }

  getProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = request.params

    const product = await this.service.getProductById(id)

    if (!product) {
      reply
        .status(HttpStatus.NOT_FOUND)
        .send({ success: false, error: 'Product not found' })
      return
    }
    reply.send({ success: true, data: productToObject(product) })
  }

  deleteProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = request.params.id
    await this.service.deleteProduct(id)
    reply.send({ success: true, message: 'Product deleted successfully' })
  }
}

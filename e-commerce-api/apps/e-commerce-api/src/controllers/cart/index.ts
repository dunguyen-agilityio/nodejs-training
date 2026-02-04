import { FastifyReply, FastifyRequest } from 'fastify'

import { HttpStatus } from '#types'

import { ICartService } from '#services/types'

import { ICartController } from './type'

export class CartController implements ICartController {
  constructor(private service: ICartService) {}

  getCart = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { userId } = request.auth
    const cart = await this.service.getCartByUserId(userId!)
    reply.send({ data: cart, success: true })
  }

  addProductToCart = async (
    request: FastifyRequest<{
      Body: { productId: string; quantity: number }
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { productId, quantity } = request.body
    const { userId } = request.auth

    const cartItem = await this.service.addProductToCart({
      userId: userId ?? '',
      productId,
      quantity,
    })

    reply.send({ data: cartItem, success: true })
  }

  removeProductFromCart = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = parseInt(request.params.id)
    await this.service.removeProductFromCart(id, request.auth.userId)
    reply.status(HttpStatus.NO_CONTENT).send()
  }
}

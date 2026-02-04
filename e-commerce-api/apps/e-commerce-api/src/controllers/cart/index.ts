import { FastifyReply, FastifyRequest } from 'fastify'

import { ICartService } from '#services/types'

import { Response } from '#utils/response'

import { ICartController } from './type'

export class CartController implements ICartController {
  constructor(private service: ICartService) {}

  getCart = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { userId } = request.auth
    const cart = await this.service.getCartByUserId(userId!)
    Response.sendSuccess(reply, cart)
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

    Response.sendSuccess(reply, cartItem)
  }

  removeProductFromCart = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = parseInt(request.params.id)
    await this.service.removeProductFromCart(id, request.auth.userId)
    Response.sendNoContent(reply)
  }
}

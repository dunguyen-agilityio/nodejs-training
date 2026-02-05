import { FastifyReply, FastifyRequest } from 'fastify'

import { ICartService } from '#services/types'

import { CartDto } from '#dtos/cart'

import { BaseController } from '../base'
import { ICartController } from './type'

export class CartController extends BaseController implements ICartController {
  constructor(private service: ICartService) {
    super()
  }

  getCart = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { userId } = request.auth
    const cart = await this.service.getCartByUserId(userId!)
    this.sendItem(reply, new CartDto(cart))
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

    this.sendCreatedItem(reply, cartItem)
  }

  removeProductFromCart = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = parseInt(request.params.id)
    await this.service.removeProductFromCart(id, request.auth.userId)
    this.sendNoContent(reply)
  }
}

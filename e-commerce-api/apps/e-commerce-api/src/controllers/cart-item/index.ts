import { FastifyReply, FastifyRequest } from 'fastify'

import { ICartItemService } from '#services/types'

import { Response } from '#utils/response'

import { ICartItemController } from './type'

export class CartItemController implements ICartItemController {
  constructor(private service: ICartItemService) {}

  deleteCartItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.service.deleteCartItem(
      parseInt(request.params.id),
      request.auth.userId,
    )

    Response.sendNoContent(reply)
  }

  updateCartItemQuantity = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: { quantity: string }
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = parseInt(request.params.id)
    const quantity = parseInt(request.body.quantity)
    await this.service.updateCartItemQuantity(id, quantity)
    Response.sendSuccess(reply, { updated: true })
  }
}

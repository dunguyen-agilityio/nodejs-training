import { FastifyReply, FastifyRequest } from 'fastify'

export interface ICartItemController {
  deleteCartItem(request: FastifyRequest, reply: FastifyReply): Promise<void>
  updateCartItemQuantity(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void>
}

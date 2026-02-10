import { FastifyReply, FastifyRequest } from 'fastify'

export interface IOrderController {
  getOrders(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

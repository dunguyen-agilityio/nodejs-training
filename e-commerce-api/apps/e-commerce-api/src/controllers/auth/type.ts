import { FastifyReply, FastifyRequest } from 'fastify'

export interface IAuthController {
  login(request: FastifyRequest, reply: FastifyReply): Promise<void>
  register(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

import { FastifyReply, FastifyRequest } from 'fastify'

import { HttpStatus } from '#types'

export const requiredId = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const { id } = request.params

  if (!id) {
    return reply
      .status(HttpStatus.BAD_REQUEST)
      .send({ success: false, error: 'Params ID is required' })
  }
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

import type { IAuthService } from '#services/types'

import { isClerkAPIResponseError } from '#utils/clerk'

import { BadRequestError, HttpStatus } from '#types'

import { transformatFromClerk } from '#dtos/user'

import { registerBodySchema } from '#schemas/auth.schema'

import { IAuthController } from './type'

export class AuthController implements IAuthController {
  constructor(private service: IAuthService) {}

  register = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof registerBodySchema>
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      const newUser = transformatFromClerk(request.body)
      const user = await this.service.register(newUser)

      reply
        .code(HttpStatus.CREATED)
        .send({ message: 'User registered successfully.', user })
    } catch (error) {
      request.log.error(`Error - register: ${error}`)
      if (isClerkAPIResponseError(error)) {
        throw new BadRequestError(error.errors[0].message)
      }

      throw error
    }
  }
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

import type { IAuthService } from '#services/types'

import { isClerkAPIResponseError } from '#utils/clerk'
import { Response } from '#utils/response'

import { BadRequestError } from '#types'

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

      Response.sendCreated(reply, user, {
        message: 'User registered successfully.',
      })
    } catch (error) {
      request.log.error(`Error - register: ${error}`)
      if (isClerkAPIResponseError(error)) {
        throw new BadRequestError(error.errors[0].message)
      }

      throw error
    }
  }
}

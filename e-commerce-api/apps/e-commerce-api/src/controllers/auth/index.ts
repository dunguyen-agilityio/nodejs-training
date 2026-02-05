import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

import type { IAuthService } from '#services/types'

import { isClerkAPIResponseError } from '#utils/clerk'

import { BadRequestError } from '#types'

import { transformatFromClerk } from '#dtos/user'

import { registerBodySchema } from '#schemas/auth.schema'

import { BaseController } from '../base'
import { IAuthController } from './type'

export class AuthController extends BaseController implements IAuthController {
  constructor(private service: IAuthService) {
    super()
  }

  register = async (
    request: FastifyRequest<{
      Body: FromSchema<typeof registerBodySchema>
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      const newUser = transformatFromClerk(request.body)
      const user = await this.service.register(newUser)

      this.sendCreatedItem(reply, user)
    } catch (error) {
      this.logError(request, 'Error - register', error)
      if (isClerkAPIResponseError(error)) {
        throw new BadRequestError(error.errors[0].message)
      }

      throw error
    }
  }
}

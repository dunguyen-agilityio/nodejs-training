import { FastifyReply, FastifyRequest } from 'fastify'

import { ICategoryService } from '#services/types'

import { Response } from '#utils/response'

import { ICategoryController } from './type'

export class CategoryController implements ICategoryController {
  constructor(private service: ICategoryService) {}

  getAll = async (_: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const categories = await this.service.getAll()
    Response.sendSuccess(reply, categories)
  }
}

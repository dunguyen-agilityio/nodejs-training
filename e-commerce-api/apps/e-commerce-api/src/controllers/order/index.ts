import { FastifyReply, FastifyRequest } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import { IOrderService } from '#services/types'

import { formatOrderDto } from '#dtos/order'

import { getOrdersSchema } from '#schemas/order'

import { BaseController } from '../base'
import { IOrderController } from './type'

export class OrderController
  extends BaseController
  implements IOrderController
{
  constructor(private service: IOrderService) {
    super()
  }

  getOrders = async (
    request: FastifyRequest<{
      Querystring: FromSchema<typeof getOrdersSchema>
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const page = request.query.page
    const pageSize = request.query.pageSize
    const userId = request.auth.userId

    const response = await this.service.getOrdersByUserId(userId, {
      page,
      pageSize,
    })

    if (response.meta?.pagination) {
      this.sendPaginated(
        reply,
        response.data.map((order) => formatOrderDto(order)),
        response.meta.pagination,
      )
    } else {
      this.sendSuccess(
        reply,
        response.data.map((order) => formatOrderDto(order)),
        response.meta,
      )
    }
  }
}

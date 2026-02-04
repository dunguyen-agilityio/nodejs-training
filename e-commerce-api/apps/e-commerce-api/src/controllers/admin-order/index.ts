import { FastifyReply, FastifyRequest } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import { IOrderService } from '#services/types'

import { Response } from '#utils/response'

import { formatOrderDto } from '#dtos/order'

import { updateOrderStatusSchema } from '#schemas/admin-order'
import { getOrdersSchema } from '#schemas/order'

import { IAdminOrderController } from './type'

export class AdminOrderController implements IAdminOrderController {
  constructor(private service: IOrderService) {}

  getAllOrders = async (
    request: FastifyRequest<{
      Querystring: FromSchema<typeof getOrdersSchema>
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const page = request.query.page
    const pageSize = request.query.pageSize

    const response = await this.service.getOrders({
      page,
      pageSize,
    })

    if (response.meta?.pagination) {
      Response.sendPaginated(
        reply,
        response.data.map((order) => formatOrderDto(order)),
        response.meta.pagination,
      )
    } else {
      Response.sendSuccess(
        reply,
        response.data.map((order) => formatOrderDto(order)),
        response.meta,
      )
    }
  }

  updateOrderStatus = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: FromSchema<typeof updateOrderStatusSchema>
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const orderId = parseInt(request.params.id)
    const { status } = request.body

    const order = await this.service.updateOrderStatus(orderId, status)

    if (order) {
      Response.sendSuccess(reply, formatOrderDto(order))
    } else {
      Response.sendNotFound(reply, 'Order not found')
    }
  }
}

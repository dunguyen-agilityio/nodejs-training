import { FastifyReply, FastifyRequest } from "fastify";
import { IOrderController } from "./type";
import { FromSchema } from "json-schema-to-ts";
import { getOrdersSchema } from "#schemas/order";
import { formatOrderDto } from "../../dtos/order";
import { IOrderService } from "#services/types";

export class OrderController implements IOrderController {
  constructor(private service: IOrderService) {}

  getOrders = async (
    request: FastifyRequest<{
      Querystring: FromSchema<typeof getOrdersSchema>;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const page = request.query.page;
    const pageSize = request.query.pageSize;
    const userId = request.auth.userId;

    const response = await this.service.getOrdersByUserId(userId, {
      page,
      pageSize,
    });
    reply.send({
      success: true,
      data: response.data.map((order) => formatOrderDto(order)),
      meta: response.meta,
    });
  };
}

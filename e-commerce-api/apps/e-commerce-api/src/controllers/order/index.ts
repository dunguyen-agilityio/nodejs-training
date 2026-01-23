import { FastifyReply, FastifyRequest } from "fastify";
import { AbstractOrderController } from "./type";
import { getAuth } from "@clerk/fastify";
import { FromSchema } from "json-schema-to-ts";
import { getOrdersSchema } from "#schemas/order";
import { formatOrderDto } from "../../dtos/order";


export class OrderController extends AbstractOrderController {
  getOrders = async (
    request: FastifyRequest<{ Querystring: FromSchema<typeof getOrdersSchema> }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const page = parseInt(request.query.page);
    const pageSize = parseInt(request.query.pageSize);
    const userId = request.auth.userId;
    console.log(userId);
    console.log(getAuth(request));

    const orders = await this.service.getOrdersByUserId(userId, { page, pageSize });
    reply.send({ success: true, data: orders.map(order => formatOrderDto(order)) });
  };
}

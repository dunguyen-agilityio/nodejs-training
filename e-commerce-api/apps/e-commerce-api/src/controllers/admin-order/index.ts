import { FastifyReply, FastifyRequest } from "fastify";
import { IAdminOrderController } from "./type";
import { FromSchema } from "json-schema-to-ts";
import { getOrdersSchema } from "#schemas/order";
import { updateOrderStatusSchema } from "#schemas/admin-order";
import { formatOrderDto } from "../../dtos/order";
import { IOrderService } from "#services/types";

export class AdminOrderController implements IAdminOrderController {
    constructor(private service: IOrderService) { }

    getAllOrders = async (
        request: FastifyRequest<{
            Querystring: FromSchema<typeof getOrdersSchema>;
        }>,
        reply: FastifyReply,
    ): Promise<void> => {
        const page = request.query.page;
        const pageSize = request.query.pageSize;

        const response = await this.service.getOrders({
            page,
            pageSize,
        });

        reply.send({
            success: true,
            data: response.data.map((order) => formatOrderDto(order)),
            meta: response.meta,
        });
    };

    updateOrderStatus = async (
        request: FastifyRequest<{
            Params: { id: string };
            Body: FromSchema<typeof updateOrderStatusSchema>;
        }>,
        reply: FastifyReply,
    ): Promise<void> => {
        const orderId = parseInt(request.params.id);
        const { status } = request.body;

        const order = await this.service.updateOrderStatus(orderId, status);

        reply.send({
            success: true,
            data: order ? formatOrderDto(order) : null,
        });
    };
}

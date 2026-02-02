import { authenticate, authorizeAdmin } from "#middlewares";
import { getOrdersSchema } from "#schemas/order";
import { updateOrderStatusSchema } from "#schemas/admin-order";
import { FastifyPluginCallback } from "fastify";

export const adminOrderRoutes: FastifyPluginCallback = (instance, _, done) => {
    const controller = instance.container.getItem("AdminOrderController");

    instance.get(
        "/",
        { preHandler: [authenticate, authorizeAdmin], schema: { querystring: getOrdersSchema } },
        controller.getAllOrders,
    );

    instance.patch(
        "/:id/status",
        { preHandler: [authenticate, authorizeAdmin], schema: { body: updateOrderStatusSchema } },
        controller.updateOrderStatus,
    );

    done();
};

import { authenticate, authorizeAdmin } from "#middlewares";
import { FastifyPluginCallback } from "fastify";

export const cartRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("cartController");
  const cartItemController = instance.container.getItem("cartItemController");

  instance.post(
    "/add",
    { preHandler: [authenticate] },
    controller.addProductToCart
  );
  instance.get("/", { preHandler: [authenticate] }, controller.getCart);
  instance.delete(
    "/:id",
    { preHandler: [authenticate, authorizeAdmin] },
    controller.deleteCart
  );
  instance.delete(
    "/items/:id",
    { preHandler: [authenticate] },
    cartItemController.deleteCartItem
  );
  instance.put(
    "/items/:id",
    { preHandler: [authenticate] },
    cartItemController.updateCartItemQuantity
  );
  done();
};

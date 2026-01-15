import { FastifyPluginCallback } from "fastify";
import { authenticate, authorizeAdmin, requiredId } from "#middlewares";
import { PaginationSchema } from "#schemas/pagination";

export const productRoutes: FastifyPluginCallback = (instance, _, done) => {
  const controller = instance.container.getItem("productController");
  instance.get(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            ...PaginationSchema.properties,
            search: { type: "string" },
          },
        },
      },
    },
    controller.getProducts
  );
  instance.get("/:id", { preHandler: [requiredId] }, controller.getProduct);

  instance.register(productAdminRoutes);

  done();
};

const productAdminRoutes: FastifyPluginCallback = (instance, _, done) => {
  instance.addHook("preHandler", authenticate);
  instance.addHook("preHandler", authorizeAdmin);

  const controller = instance.container.getItem("productController");
  instance.post(
    "/",
    {
      preHandler: [authenticate, authorizeAdmin],
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
          },
        },
      },
    },
    controller.addNewProduct
  );

  instance.delete(
    "/:id",
    { preHandler: [requiredId] },
    controller.deleteProduct
  );

  done();
};

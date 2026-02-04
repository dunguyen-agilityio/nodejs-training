import { FastifyPluginCallback } from "fastify";
import { authenticate, authorizeAdmin, requiredId } from "#middlewares";
import { PaginationSchema } from "#schemas/pagination";

export const productRoutes: FastifyPluginCallback = (instance, _, done) => {
  const { productController } = instance.container.controllers;
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
    productController.getProducts,
  );
  instance.get(
    "/:id",
    { preHandler: [requiredId] },
    productController.getProduct,
  );

  instance.register(productAdminRoutes);
  instance.register(productAdminRoutes, { prefix: "/admin" });

  done();
};

const productAdminRoutes: FastifyPluginCallback = (instance, _, done) => {
  instance.addHook("preHandler", authenticate);
  instance.addHook("preHandler", authorizeAdmin);

  const { productController } = instance.container.controllers;

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
    productController.addNewProduct,
  );

  instance.put(
    "/:id",
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
    productController.updateProduct,
  );

  instance.delete(
    "/:id",
    { preHandler: [requiredId] },
    productController.deleteProduct,
  );

  done();
};

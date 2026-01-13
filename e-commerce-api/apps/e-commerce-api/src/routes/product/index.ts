import { FastifyPluginCallback } from "fastify";

export const productRoutes: FastifyPluginCallback = (
  instance,
  options,
  done
) => {
  const controller = instance.container.getItem("Product").controller;
  instance.post(
    "/",
    // {
    //   schema: {
    //     body: {
    //       type: "object",
    //       required: ["username", "email"],
    //       properties: {
    //         username: { type: "string" },
    //         email: { type: "string", format: "email" },
    //       },
    //     },
    //   },
    // },
    controller.addNewProduct
  );
  instance.get("/", controller.getProducts);
  instance.get("/:id", controller.getProductById);

  done();
};

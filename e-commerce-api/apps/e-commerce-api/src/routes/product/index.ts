import { FastifyPluginCallback } from "fastify";
import { AbstractProductController } from "../../controllers/product/type";

export const createProductRoutes: (
  controller: AbstractProductController
) => FastifyPluginCallback = (controller) => (instance, options, done) => {
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

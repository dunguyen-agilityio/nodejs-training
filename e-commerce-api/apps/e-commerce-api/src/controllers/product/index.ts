import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractProductController } from "./type";
import type { AbstractProductService } from "@repo/typeorm-service/services";
import { Product } from "@repo/typeorm-service";

export class ProductController extends AbstractProductController {
  constructor(private service: AbstractProductService) {
    super();
  }

  addNewProduct = async (
    request: FastifyRequest<{ Body: Omit<Product, "id"> }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const productData = request.body;
      if (!productData) {
        reply
          .status(400)
          .send({ success: false, error: "Product data is required" });
        return;
      }

      const newProduct = await this.service.saveProduct(productData);
      reply.status(201).send({ success: true, data: newProduct });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  getProducts = async (
    request: FastifyRequest<{
      Querystring: { page: string; pageSize: string; query: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { page = "1", pageSize = "10", query = "" } = request.query;
      const products = await this.service.getProducts({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        query,
      });
      reply.send({ success: true, data: products });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  getProductById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      if (!id) {
        reply
          .status(400)
          .send({ success: false, error: "Product ID is required" });
        return;
      }
      const product = await this.service.getProductById(parseInt(id));
      if (!product) {
        reply.status(404).send({ success: false, error: "Product not found" });
        return;
      }
      reply.send({ success: true, data: product });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };
}

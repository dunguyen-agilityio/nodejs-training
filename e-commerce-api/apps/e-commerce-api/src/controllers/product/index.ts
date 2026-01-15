import { FastifyRequest, FastifyReply } from "fastify";

import { AbstractProductController } from "./type";
import { Product } from "#entities";

export class ProductController extends AbstractProductController {
  updateProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const id = parseInt(request.params.id);

    const product = await this.service.getProductById(id);

    if (!product) {
    }

    // this.service.updateProduct();
    reply.code(204).send();
  };

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
      const response = await this.service.getProducts({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        query,
      });
      reply.send({
        success: true,
        ...response,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  getProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;

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

  deleteProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;

      await this.service.deleteProduct(parseInt(id));
      reply.send({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };
}

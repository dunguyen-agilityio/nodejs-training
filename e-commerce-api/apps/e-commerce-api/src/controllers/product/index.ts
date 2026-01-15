import { FastifyRequest, FastifyReply } from "fastify";

import { AbstractProductController } from "./type";
import { Product } from "#entities";
import { HttpStatus } from "#types/http-status";

export class ProductController extends AbstractProductController {
  updateProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const id = parseInt(request.params.id);

    const product = await this.service.getProductById(id);

    // this.service.updateProduct();
    reply.code(204).send();
  };

  addNewProduct = async (
    request: FastifyRequest<{ Body: Omit<Product, "id"> }>,
    reply: FastifyReply
  ): Promise<void> => {
    const productData = request.body;
    const newProduct = await this.service.saveProduct(productData);
    reply.status(HttpStatus.CREATED).send({ success: true, data: newProduct });
  };

  getProducts = async (
    request: FastifyRequest<{
      Querystring: { page: string; pageSize: string; query: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
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
  };

  getProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { id } = request.params;

    const product = await this.service.getProductById(parseInt(id));
    if (!product) {
      reply
        .status(HttpStatus.NOT_FOUND)
        .send({ success: false, error: "Product not found" });
      return;
    }
    reply.send({ success: true, data: product });
  };

  deleteProduct = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const id = parseInt(request.params.id);
    await this.service.deleteProduct(id);
    reply.send({ success: true, message: "Product deleted successfully" });
  };
}

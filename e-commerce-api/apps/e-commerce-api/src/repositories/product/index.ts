import { Product } from "#entities";
import { AbstractProductRepository } from "./type";

export class ProductRepository extends AbstractProductRepository {
  async getById(id: number): Promise<Product | null> {
    return await this.findOneBy({ id });
  }

  async getProducts(params: {
    query: string;
    skip: number;
    pageSize: number;
  }): Promise<[Product[], number]> {
    const { query, skip, pageSize } = params;

    return this.createQueryBuilder("product")
      .where("product.name LIKE :query OR product.description LIKE :query", {
        query: `%${query}%`,
      })
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();
  }

  async decreaseStock(productId: number, quantity: number): Promise<void> {
    const product = await this.createQueryBuilder("product")
      .where("product.id = :id", { id: productId })
      .setLock("pessimistic_write")
      .getOne();
    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    product.stock -= quantity;
    await this.save(product);
  }
}

import { Product } from "#entities";
import { QueryRunner } from "typeorm";
import { AbstractProductRepository } from "./type";
import { ProductMetric } from "#types/metrics";

export class ProductRepository extends AbstractProductRepository {
  async getById(id: string): Promise<Product | null> {
    return await this.findOneBy({ id });
  }

  async getProducts(params: {
    query: string;
    skip: number;
    pageSize: number;
  }): Promise<[Product[], number]> {
    const { query, skip, pageSize } = params;

    return this.createQueryBuilder("product")
      .where("product.name ILIKE :query OR product.description ILIKE :query", {
        query: `%${query}%`,
      })
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();
  }

  async decreaseStock(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await queryRunner.manager.findOne(Product, {
      where: { id: productId },
      lock: { mode: "pessimistic_write" },
    });

    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    product.stock -= quantity;
    await queryRunner.manager.save(product);
  }

  async getAdminMetrics(): Promise<ProductMetric | undefined> {
    const metric = await this.createQueryBuilder("product")
      .select("COUNT(product.id)", "totalProducts")
      .addSelect("SUM(product.stock)", "totalStock")
      .addSelect("SUM(product.price * product.stock)", "totalValue")
      // Cache the result for 1 minute to protect the DB
      .cache("metrics", 60000)
      .getRawOne<ProductMetric>();

    return metric;
  }
}

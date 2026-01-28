import { Product } from "#entities";
import { QueryRunner } from "typeorm";
import { BaseRepository } from "../base";
import { ProductMetric } from "#types/metrics";

export abstract class AbstractProductRepository extends BaseRepository<Product> {
  abstract getById(id: number): Promise<Product | null>;
  abstract getProducts(params: {
    query: string;
    skip: number;
    pageSize: number;
  }): Promise<[Product[], number]>;

  abstract decreaseStock(
    queryRunner: QueryRunner,
    productId: number,
    quantity: number,
  ): Promise<void>;
  abstract getAdminMetrics(): Promise<ProductMetric | undefined>;
}

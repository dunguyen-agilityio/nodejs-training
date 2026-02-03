import { Product } from "#entities";
import { QueryRunner } from "typeorm";
import { BaseRepository } from "../base";
import { ProductMetric } from "#types/metrics";
import { Params } from "#types/query";

export abstract class AbstractProductRepository extends BaseRepository<Product> {
  abstract getById(id: string): Promise<Product | null>;
  abstract getProducts(
    params: Omit<Params, "page"> & { skip: number },
  ): Promise<[Product[], number]>;

  abstract decreaseStock(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
  ): Promise<void>;
  abstract getAdminMetrics(): Promise<ProductMetric | undefined>;
}

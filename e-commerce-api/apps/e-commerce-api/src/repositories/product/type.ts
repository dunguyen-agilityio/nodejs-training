import { Product } from "#entities";
import { BaseRepository } from "../base";

export abstract class AbstractProductRepository extends BaseRepository<Product> {
  abstract getById(id: number): Promise<Product | null>;
  abstract getProducts(params: {
    query: string;
    skip: number;
    pageSize: number;
  }): Promise<Product[]>;
}

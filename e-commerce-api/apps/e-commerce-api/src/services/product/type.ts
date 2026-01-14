import { Product } from "#entities";
import { AbstractProductRepository } from "#repositories/types";
import { BaseService } from "../base";

type Params = {
  query: string;
  page: number;
  pageSize: number;
};

export abstract class AbstractProductService extends BaseService<
  Product,
  AbstractProductRepository
> {
  abstract getProducts(params: Params): Promise<Product[]>;
  abstract getProductById(id: number): Promise<Product | null>;
  abstract saveProduct(product: Omit<Product, "id">): Promise<Product>;
  abstract deleteProduct(id: number): Promise<void>;
}

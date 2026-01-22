import { Product } from "#entities";
import { ProductRepository } from "#repositories/types";
import { Pagination, Params } from "#types/query";
import { BaseService } from "../base";

export abstract class AbstractProductService extends BaseService {
  protected productRepository: ProductRepository = null!;

  constructor(base: AbstractProductService, provider: BaseService) {
    super(provider);
    Object.assign(this, base);
  }

  abstract getProducts(
    params: Params,
  ): Promise<{ data: Product[]; meta: { pagination: Pagination } }>;
  abstract getProductById(id: number): Promise<Product | null>;
  abstract saveProduct(product: Omit<Product, "id">): Promise<Product>;
  abstract updateProduct(
    id: number,
    product: Partial<
      Pick<
        Product,
        "category" | "description" | "images" | "name" | "price" | "stock"
      >
    >,
  ): Promise<Product>;
  abstract deleteProduct(id: number): Promise<void>;
}

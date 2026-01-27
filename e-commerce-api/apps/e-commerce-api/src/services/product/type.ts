import { Product } from "#entities";
import { Pagination, Params } from "#types/query";

export interface IProductService {
  getProducts(
    params: Params,
  ): Promise<{ data: Product[]; meta: { pagination: Pagination } }>;
  getProductById(id: number): Promise<Product | null>;
  saveProduct(product: Omit<Product, "id">): Promise<Product>;
  updateProduct(
    id: number,
    product: Partial<
      Pick<
        Product,
        "category" | "description" | "images" | "name" | "price" | "stock"
      >
    >,
  ): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

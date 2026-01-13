import { Product } from "#entities";
import { AbstractProductRepository } from "#repositories/types";
import { AbstractProductService } from "./type";

export class ProductService extends AbstractProductService {
  constructor(private repository: AbstractProductRepository) {
    super();
  }

  async getProducts(params: {
    query: string;
    page: number;
    pageSize: number;
  }): Promise<Product[]> {
    const { query, page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const products = await this.repository.getProducts({
      pageSize,
      query,
      skip,
    });

    return products;
  }

  async getProductById(id: number): Promise<Product | null> {
    const product = await this.repository.getById(id);
    return product;
  }

  async saveProduct(product: Omit<Product, "id">): Promise<Product> {
    return this.repository.save(product);
  }
}

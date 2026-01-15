import { Product } from "#entities";
import { Pagination } from "#types/query";
import { AbstractProductService } from "./type";

export class ProductService extends AbstractProductService {
  async getProducts(params: {
    query: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: Product[]; meta: { pagination: Pagination } }> {
    const { query, page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const [products, totalCount] = await this.productRepository.getProducts({
      pageSize,
      query,
      skip,
    });

    return {
      data: products,
      meta: {
        pagination: {
          totalItems: totalCount,
          itemCount: products.length,
          itemsPerPage: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: Math.floor(skip / pageSize) + 1,
        },
      },
    };
  }

  async getProductById(id: number): Promise<Product | null> {
    const product = await this.productRepository.getById(id);
    return product;
  }

  async saveProduct(product: Omit<Product, "id">): Promise<Product> {
    return this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}

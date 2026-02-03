import { Product } from "#entities";
import { IPaymentGatewayProvider } from "#providers/types";
import { ProductRepository } from "#repositories/types";
import { Dependencies } from "#services/base";
import { NotFoundError } from "#types/error";
import { PartialProduct } from "#types/product";
import { Pagination, Params } from "#types/query";
import { IProductService } from "./type";

export class ProductService implements IProductService {
  private productRepository: ProductRepository;
  private paymentGatewayProvider: IPaymentGatewayProvider;

  constructor(dependencies: Dependencies) {
    Object.assign(this, dependencies);
  }

  async getProducts(
    params: Params,
  ): Promise<{ data: Product[]; meta: { pagination: Pagination } }> {
    const { query, page, pageSize, categories } = params;
    const skip = (page - 1) * pageSize;

    const [products, totalCount] = await this.productRepository.getProducts({
      pageSize,
      query,
      skip,
      categories,
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

  async getProductById(id: string): Promise<Product | null> {
    const product = await this.productRepository.getById(id);

    return product;
  }

  async saveProduct(payload: Omit<Product, "id">): Promise<Product> {
    try {
      const { price, name, images, description } = payload;

      const newProduct = await this.paymentGatewayProvider.createProduct({
        name,
        description,
        images,
        active: true,
        default_price_data: { currency: "usd", unit_amount: price * 100 },
      });

      const product = await this.productRepository.save({
        ...payload,
        id: newProduct.id,
      });

      return product;
    } catch (error) {
      console.error("Error - saveProduct", error);
      throw error;
    }
  }

  async updateProduct(id: string, body: PartialProduct): Promise<Product> {
    const product = await this.getProductById(id);

    if (!product) throw new NotFoundError(`Not found Product by ID: ${id}`);

    return await this.productRepository.save({ ...product, ...body });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}

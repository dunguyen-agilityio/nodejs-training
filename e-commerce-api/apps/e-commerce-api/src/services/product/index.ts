import { Product } from "#entities";
import { IPaymentGatewayProvider } from "#providers/types";
import { ProductRepository } from "#repositories/types";
import { Dependencies } from "#services/base";
import { NotFoundError } from "#types/error";
import { Pagination } from "#types/query";
import { IProductService } from "./type";

export class ProductService implements IProductService {
  private productRepository: ProductRepository;
  private paymentGatewayProvider: IPaymentGatewayProvider;

  constructor(dependencies: Dependencies) {
    Object.assign(this, dependencies);
  }

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
    try {
      const { price } = product;
      const newProduct = this.productRepository.create(product);

      await this.paymentGatewayProvider.createProduct({
        ...newProduct,
        id: newProduct.id.toString(),
        active: true,
        default_price_data: { currency: "usd", unit_amount: price },
        url: `${process.env.CLIENT_BASE_URL}/products/${newProduct.id}`,
      });

      await this.productRepository.save(newProduct);

      return newProduct;
    } catch (error) {
      console.error("Error - saveProduct", error);
      throw error;
    }
  }

  async updateProduct(
    id: number,
    body: Partial<
      Pick<
        Product,
        "category" | "description" | "images" | "name" | "price" | "stock"
      >
    >,
  ): Promise<Product> {
    const product = await this.getProductById(id);

    if (!product) throw new NotFoundError(`Not found Product by ID: ${id}`);

    return await this.productRepository.save({ ...product, ...body });
  }

  async deleteProduct(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}

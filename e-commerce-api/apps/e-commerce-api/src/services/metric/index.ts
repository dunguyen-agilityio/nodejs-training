import { ProductRepository } from "#repositories/types";
import { ProductMetric } from "#types/metrics";
import { IMetricService } from "./type";

export class MetricService implements IMetricService {
  constructor(private productRepository: ProductRepository) {}

  async getDashboardStats(): Promise<ProductMetric & { updatedAt: string }> {
    const rawData = await this.productRepository.getAdminMetrics();

    return {
      totalProducts: Number(rawData?.totalProducts || 0),
      totalStock: Number(rawData?.totalStock || 0),
      totalValue: Number(rawData?.totalValue || 0),
      updatedAt: new Date().toISOString(),
    };
  }
}

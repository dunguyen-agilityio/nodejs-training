import { ProductRepository } from "#repositories/types";
import { Dependencies } from "#services/base";
import { ProductMetric } from "#types/metrics";
import { IMetricService } from "./type";

export class MetricService implements IMetricService {
  private productRepository: ProductRepository;

  constructor(dependecies: Dependencies) {
    Object.assign(this, dependecies);
  }

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

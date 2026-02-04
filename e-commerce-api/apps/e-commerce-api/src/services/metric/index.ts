import { ProductMetric } from '#types'

import type { TProductRepository } from '#repositories'

import { IMetricService } from './type'

export class MetricService implements IMetricService {
  constructor(private productRepository: TProductRepository) {}

  async getDashboardStats(): Promise<ProductMetric & { updatedAt: string }> {
    const rawData = await this.productRepository.getAdminMetrics()

    return {
      totalProducts: Number(rawData?.totalProducts || 0),
      totalStock: Number(rawData?.totalStock || 0),
      totalValue: Number(rawData?.totalValue || 0),
      updatedAt: new Date().toISOString(),
    }
  }
}

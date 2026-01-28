import { ProductMetric } from "#types/metrics";

export interface IMetricService {
  getDashboardStats(): Promise<ProductMetric & { updatedAt: string }>;
}

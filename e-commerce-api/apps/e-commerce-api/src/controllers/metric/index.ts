import { FastifyReply, FastifyRequest } from "fastify";
import { IMetricController } from "./type";
import { IMetricService } from "#services/types";

export class MetricController implements IMetricController {
  constructor(private metricService: IMetricService) {}

  getProductMetrics = async (_: FastifyRequest, reply: FastifyReply) => {
    console.log(this);
    const rawData = await this.metricService.getDashboardStats();
    reply.send(rawData);
  };
}

import { FastifyReply, FastifyRequest } from 'fastify'

import { IMetricService } from '#services/types'

import { IMetricController } from './type'

export class MetricController implements IMetricController {
  constructor(private metricService: IMetricService) {}

  getProductMetrics = async (_: FastifyRequest, reply: FastifyReply) => {
    const rawData = await this.metricService.getDashboardStats()
    reply.send(rawData)
  }
}

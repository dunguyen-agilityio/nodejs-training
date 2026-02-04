import { FastifyReply, FastifyRequest } from 'fastify'

import { IMetricService } from '#services/types'

import { Response } from '#utils/response'

import { IMetricController } from './type'

export class MetricController implements IMetricController {
  constructor(private metricService: IMetricService) {}

  getProductMetrics = async (_: FastifyRequest, reply: FastifyReply) => {
    const rawData = await this.metricService.getDashboardStats()
    Response.sendSuccess(reply, rawData)
  }
}

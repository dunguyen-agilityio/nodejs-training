import { auth } from '@clerk/nextjs/server'

import { get, patch } from './api'
import { config } from './config'
import { ApiPagination, ApiResponse, Order, OrderStatus } from './types'

export async function getUserOrders(page: number = 1, pageSize: number = 10) {
  const { getToken } = await auth()

  const token = await getToken({
    template: config.clerk.tokenTemplate,
    expiresInSeconds: 3,
  })

  const response = await get<
    ApiResponse<Order[], { meta: { pagination: ApiPagination } }>
  >(`${config.api.endpoint}/orders?page=${page}&pageSize=${pageSize}`, {
    Authorization: `Bearer ${token}`,
  })

  return response
}

export async function getAllOrders(page: number = 1, pageSize: number = 20) {
  const { getToken } = await auth()

  const token = await getToken({
    template: config.clerk.tokenTemplate,
    expiresInSeconds: 3,
  })

  const response = await get<
    ApiResponse<Order[], { meta: { pagination: ApiPagination } }>
  >(`${config.api.endpoint}/admin/orders?page=${page}&pageSize=${pageSize}`, {
    Authorization: `Bearer ${token}`,
  })

  return response
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { getToken } = await auth()

  const token = await getToken({
    template: config.clerk.tokenTemplate,
    expiresInSeconds: 3,
  })

  const response = await patch<ApiResponse<Order>>(
    `${config.api.endpoint}/admin/orders/${orderId}/status`,
    { status },
    {
      Authorization: `Bearer ${token}`,
    },
  )

  return response.data
}

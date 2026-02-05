import { get, patch } from './api'
import { createAuthorizationHeader } from './auth'
import { config } from './config'
import { ApiPagination, ApiResponse, Order, OrderStatus } from './types'

export async function getUserOrders(page: number = 1, pageSize: number = 10) {
  const headers = await createAuthorizationHeader()

  const response = await get<
    ApiResponse<Order[], { meta: { pagination: ApiPagination } }>
  >(`${config.api.endpoint}/orders?page=${page}&pageSize=${pageSize}`, headers)

  return response
}

type AllOrdersResponse = ApiResponse<
  Order[],
  { meta: { pagination: ApiPagination } }
>
export async function getAllOrders(page: number = 1, pageSize: number = 20) {
  const headers = await createAuthorizationHeader()
  const url = `${config.api.endpoint}/admin/orders?page=${page}&pageSize=${pageSize}`
  const response = await get<AllOrdersResponse>(url, headers)
  return response
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const headers = await createAuthorizationHeader()

  const response = await patch<ApiResponse<Order>>(
    `${config.api.endpoint}/admin/orders/${orderId}/status`,
    { status },
    headers,
  )

  return response.data
}

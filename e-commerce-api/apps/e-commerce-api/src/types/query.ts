import dayjs from 'dayjs'

import { OrderStatus, ProductStatus } from '#entities'

/**
 * Query parameters for filtering and paginating products
 */
export type ProductQueryParams = {
  query: string
  page: number
  pageSize: number
  categories: string[]
  status?: ProductStatus | 'all'
}

/**
 * Pagination metadata for paginated API responses
 */
export type Pagination = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export type OrderQueryParams = {
  page: number
  pageSize: number
  status?: OrderStatus
  date?: dayjs.Dayjs
}

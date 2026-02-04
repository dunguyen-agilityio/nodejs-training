/**
 * Query parameters for filtering and paginating products
 */
export type ProductQueryParams = {
  query: string
  page: number
  pageSize: number
  categories: string[]
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

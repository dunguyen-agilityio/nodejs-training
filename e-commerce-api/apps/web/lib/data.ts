import { get } from './api'
import { fetchCategories } from './category'
import { config } from './config'
import { ApiPagination, ApiResponse, CartItem, Product } from './types'

export interface GetProductsParams {
  search?: string
  category?: string
  sort?: string
  page?: number
  limit?: number
}

export async function getProducts({
  search,
  category,
  sort,
  page = 1,
  limit = 10,
}: GetProductsParams) {
  const params = new URLSearchParams()
  if (search) params.append('query', search)
  if (category && category !== 'All') params.append('category', category)
  if (sort) params.append('sort', sort)
  if (page) params.append('page', page.toString())
  if (limit) params.append('pageSize', limit.toString())

  const response = await get<
    ApiResponse<
      Product[],
      {
        meta: {
          pagination: ApiPagination
        }
      }
    >
  >(`${config.api.endpoint}/products?${params.toString()}`)

  const { currentPage, totalItems, totalPages } = response.meta.pagination

  return {
    products: response.data,
    pagination: {
      currentPage: page,
      totalPages,
      total: totalItems,
      hasMore: currentPage < totalPages,
    },
  }
}

export async function getProductById(id: string) {
  return get<ApiResponse<Product>>(`${config.api.endpoint}/products/${id}`)
}

export async function getCart(headers: HeadersInit = {}) {
  return get<ApiResponse<CartItem[]>>(`${config.api.endpoint}/cart`, headers)
}

export async function getCategories() {
  const categories = await fetchCategories()
  return ['All', ...Array.from(new Set(categories.map((p) => p.name)))]
}

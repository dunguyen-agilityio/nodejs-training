import { API_ROUTES, get } from './api'
import { fetchCategories } from './category'
import { config } from './config'
import { ApiPagination, ApiResponse, CartItem, Product } from './types'

export interface GetProductsParams {
  search?: string
  category?: string | string[]
  sort?: string
  page?: number
  limit?: number
  status?: string
}

export async function getProducts({
  search,
  category,
  sort,
  page = 1,
  limit = 10,
  status,
}: GetProductsParams) {
  try {
    const params = new URLSearchParams()
    if (search) params.append('query', search)
    if (status) params.append('status', status)

    // Handle multiple categories
    if (category) {
      const categories = Array.isArray(category) ? category : [category]
      const filteredCategories = categories.filter((c) => c !== 'All')
      if (filteredCategories.length > 0) {
        params.append('category', filteredCategories.join(','))
      }
    }
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
    >(`${config.api.endpoint}${API_ROUTES.PRODUCT.GET}?${params.toString()}`)

    const { currentPage, totalItems, totalPages } = response.meta.pagination

    return {
      error: null,
      products: response.data,
      pagination: {
        currentPage: page,
        totalPages,
        total: totalItems,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Failed to fetch products',
      products: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        total: 0,
        hasMore: false,
      },
    }
  }
}

export async function getProductById(id: string) {
  return get<Product>(
    `${config.api.endpoint}${API_ROUTES.PRODUCT.GET_BY_ID(id)}`,
  )
}

export async function getCart(headers: HeadersInit = {}) {
  return get<ApiResponse<CartItem[]>>(
    `${config.api.endpoint}${API_ROUTES.CART.GET}`,
    headers,
  )
}

export async function getCategories() {
  const categories = await fetchCategories()
  return ['All', ...Array.from(new Set(categories.map((p) => p.name)))]
}

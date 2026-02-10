'use server'

import { API_ROUTES, get } from './api'
import { config } from './config'
import { ApiResponse, Category } from './types'

export const fetchCategories = async () => {
  const response = await get<ApiResponse<Category[]>>(
    `${config.api.endpoint}${API_ROUTES.CATEGORY.GET}`,
    {},
    { next: { revalidate: 1 * 60 * 60 * 1000 } },
  )
  return response.data
}

'use server'

import { API_ROUTES, get } from './api'
import { config } from './config'
import { ApiResponse, Category } from './types'

export const fetchCategories = async () => {
  const response = await get<ApiResponse<Category[]>>(
    `${config.api.endpoint}${API_ROUTES.CATEGORY.GET}`,
    {},
    { cache: 'force-cache' },
  )
  return response.data
}

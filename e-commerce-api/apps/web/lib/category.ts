import { get } from './api'
import { config } from './config'
import { ApiResponse, Category } from './types'

export const fetchCategories = async () => {
  const response = await get<ApiResponse<Category[]>>(
    `${config.api.endpoint}/categories`,
    {},
    { cache: 'force-cache' },
  )
  return response.data
}

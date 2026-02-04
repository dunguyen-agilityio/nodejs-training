import { UnauthorizedError } from './errors'

const defaultHeaders = {}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json()) as {
      message: string
      status: number
    }
    if (response.status === 401) {
      throw new UnauthorizedError(error.message)
    }

    throw new Error(error.message || 'Something went wrong')
  }
  if (response.status === 204) {
    return true as T
  }
  return response.json()
}

export async function get<T>(
  path: string,
  headers: HeadersInit = {},
  options: Partial<RequestInit> = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { ...defaultHeaders, ...headers },
  })

  return handleResponse<T>(response)
}

export async function post<T>(
  path: string,
  data: unknown,
  headers: HeadersInit = {},
): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(response)
}

export async function put<T>(
  path: string,
  data: unknown,
  headers: HeadersInit = {},
): Promise<T> {
  const response = await fetch(path, {
    method: 'PUT',
    headers: {
      ...defaultHeaders,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(response)
}

export async function patch<T>(
  path: string,
  data: unknown,
  headers: HeadersInit = {},
): Promise<T> {
  const response = await fetch(path, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(response)
}

export async function del<T>(
  path: string,
  headers: HeadersInit = {},
): Promise<T> {
  const response = await fetch(path, {
    method: 'DELETE',
    headers: { ...defaultHeaders, ...headers },
  })
  return handleResponse<T>(response)
}

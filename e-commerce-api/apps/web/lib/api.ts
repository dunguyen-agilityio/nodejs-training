import { API_ENPOINT } from "./constants";

const defaultHeaders = {};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
  if (response.status === 204) {
    return true as T;
  }
  return response.json();
}

export async function get<T>(
  path: string,
  headers: HeadersInit = {}
): Promise<T> {
  const response = await fetch(`${API_ENPOINT}${path}`, {
    headers: { ...defaultHeaders, ...headers },
  });
  return handleResponse<T>(response);
}

export async function post<T>(
  path: string,
  data: unknown,
  headers: HeadersInit = {}
): Promise<T> {
  const response = await fetch(`${API_ENPOINT}${path}`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function put<T>(
  path: string,
  data: unknown,
  headers: HeadersInit = {}
): Promise<T> {
  const response = await fetch(`${API_ENPOINT}${path}`, {
    method: "PUT",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function del<T>(
  path: string,
  headers: HeadersInit = {}
): Promise<T> {
  const response = await fetch(`${API_ENPOINT}${path}`, {
    method: "DELETE",
    headers: { ...defaultHeaders, ...headers },
  });
  return handleResponse<T>(response);
}

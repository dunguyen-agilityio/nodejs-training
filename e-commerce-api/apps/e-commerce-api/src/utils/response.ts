import { FastifyReply } from 'fastify'

import { HttpStatus, Pagination } from '#types'

/**
 * Standardized API response structure
 */
export interface ApiResponseSuccess<T = unknown> {
  success: true
  data: T
  meta?: {
    pagination?: Pagination
    [key: string]: unknown
  }
}

export interface ApiResponseError {
  success: false
  error: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError

/**
 * Response utility class for standardizing API responses
 */
export class ApiResponseBuilder {
  /**
   * Create a successful response with data
   */
  static success<T>(
    data: T,
    meta?: ApiResponseSuccess['meta'],
  ): ApiResponseSuccess<T> {
    const response: ApiResponseSuccess<T> = {
      success: true,
      data,
    }
    if (meta) {
      response.meta = meta
    }
    return response
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: Pagination,
    additionalMeta?: Record<string, unknown>,
  ): ApiResponseSuccess<T[]> {
    return {
      success: true,
      data,
      meta: {
        pagination,
        ...additionalMeta,
      },
    }
  }

  /**
   * Create an error response
   */
  static error(message: string, details?: unknown): ApiResponseError {
    const response: ApiResponseError = {
      success: false,
      error: message,
    }
    if (details) {
      response.details = details
    }
    return response
  }

  /**
   * Send a successful response (200 OK)
   */
  static sendSuccess<T>(
    reply: FastifyReply,
    data: T,
    meta?: ApiResponseSuccess['meta'],
  ): void {
    reply.status(HttpStatus.OK).send(this.success(data, meta))
  }

  /**
   * Send a created response (201 Created)
   */
  static sendCreated<T>(
    reply: FastifyReply,
    data: T,
    meta?: ApiResponseSuccess['meta'],
  ): void {
    reply.status(HttpStatus.CREATED).send(this.success(data, meta))
  }

  /**
   * Send a paginated response (200 OK)
   */
  static sendPaginated<T>(
    reply: FastifyReply,
    data: T[],
    pagination: Pagination,
    additionalMeta?: Record<string, unknown>,
  ): void {
    reply
      .status(HttpStatus.OK)
      .send(this.paginated(data, pagination, additionalMeta))
  }

  /**
   * Send a no content response (204 No Content)
   */
  static sendNoContent(reply: FastifyReply): void {
    reply.status(HttpStatus.NO_CONTENT).send()
  }

  /**
   * Send an error response
   */
  static sendError(
    reply: FastifyReply,
    statusCode: number,
    message: string,
    details?: unknown,
  ): void {
    reply.status(statusCode).send(this.error(message, details))
  }

  /**
   * Send a bad request error (400 Bad Request)
   */
  static sendBadRequest(
    reply: FastifyReply,
    message: string,
    details?: unknown,
  ): void {
    this.sendError(reply, HttpStatus.BAD_REQUEST, message, details)
  }

  /**
   * Send a not found error (404 Not Found)
   */
  static sendNotFound(
    reply: FastifyReply,
    message: string = 'Resource not found',
    details?: unknown,
  ): void {
    this.sendError(reply, HttpStatus.NOT_FOUND, message, details)
  }

  /**
   * Send an unauthorized error (401 Unauthorized)
   */
  static sendUnauthorized(
    reply: FastifyReply,
    message: string = 'Unauthorized',
    details?: unknown,
  ): void {
    this.sendError(reply, HttpStatus.UNAUTHORIZED, message, details)
  }

  /**
   * Send a forbidden error (403 Forbidden)
   */
  static sendForbidden(
    reply: FastifyReply,
    message: string = 'Forbidden',
    details?: unknown,
  ): void {
    this.sendError(reply, HttpStatus.FORBIDDEN, message, details)
  }

  /**
   * Send an internal server error (500 Internal Server Error)
   */
  static sendInternalError(
    reply: FastifyReply,
    message: string = 'Internal server error',
    details?: unknown,
  ): void {
    this.sendError(reply, HttpStatus.INTERNAL_SERVER_ERROR, message, details)
  }
}

/**
 * Convenience export for shorter usage
 */
export const Response = ApiResponseBuilder

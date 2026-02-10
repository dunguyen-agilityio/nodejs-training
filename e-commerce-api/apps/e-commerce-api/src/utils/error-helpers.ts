import { ApiError, BadRequestError, UnexpectedError } from '#types'

/**
 * Utility functions for error handling
 */

/**
 * Convert a generic Error to BadRequestError
 * Useful for validation errors or user input errors
 */
export function toBadRequestError(error: Error | string): BadRequestError {
  if (typeof error === 'string') {
    return new BadRequestError(error)
  }
  return new BadRequestError(error.message, { originalError: error.name })
}

/**
 * Ensure error is an ApiError instance
 * Converts generic Error to UnexpectedError if needed
 */
export function ensureApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new UnexpectedError(error.message, {
      originalError: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }

  return new UnexpectedError('An unknown error occurred')
}

/**
 * Create a formatted error message from validation errors
 */
export function formatValidationErrors(
  errors: Array<{ field: string; message: string }>,
): string {
  if (errors.length === 0) return 'Validation failed'
  if (errors.length === 1) {
    const firstError = errors[0]
    if (!firstError) return 'Validation failed'
    return firstError.message
  }

  const messages = errors.map((err) => `${err.field}: ${err.message}`)
  return `Validation failed: ${messages.join(', ')}`
}

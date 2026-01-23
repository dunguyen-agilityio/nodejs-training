import { HttpStatus } from "./http-status";

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", details?: any) {
    super(HttpStatus.UNAUTHORIZED, message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details?: any) {
    super(HttpStatus.FORBIDDEN, message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict", details?: any) {
    super(HttpStatus.CONFLICT, message, details);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests", details?: any) {
    super(HttpStatus.TOO_MANY_REQUESTS, message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found", details?: any) {
    super(HttpStatus.NOT_FOUND, message, details);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request", details?: any) {
    super(HttpStatus.BAD_REQUEST, message, details);
  }
}

export class UnexpectedError extends ApiError {
  constructor(message = "Internal server error", details?: any) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, details);
  }
}

type ClerkAPIError = {
  code: string;
  message: string;
  longMessage: string;
  meta: object;
};

export type ClerkAPIResponseError = {
  clerkError: boolean;
  code: string;
  status: number;
  clerkTraceId: string;
  errors: [ClerkAPIError];
};

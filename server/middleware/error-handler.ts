import type { Request, Response, NextFunction } from "express";

/**
 * Custom API error class with status code
 */
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Wraps async route handlers to catch errors and pass them to error handling middleware
 */
export function handleAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error("Route error:", error);

      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal server error";

      res.status(statusCode).json({ error: message });
    });
  };
}

/**
 * Error factory functions for common HTTP errors
 */
export const notFound = (message: string = "Resource not found") =>
  new ApiError(404, message);

export const badRequest = (message: string = "Bad request") =>
  new ApiError(400, message);

export const unauthorized = (message: string = "Unauthorized") =>
  new ApiError(401, message);

export const forbidden = (message: string = "Forbidden") =>
  new ApiError(403, message);

export const conflict = (message: string = "Conflict") =>
  new ApiError(409, message);

export const serverError = (message: string = "Internal server error") =>
  new ApiError(500, message);

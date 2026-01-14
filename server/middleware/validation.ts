import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import { badRequest } from "./error-handler";

/**
 * Validates request body against a Zod schema
 * Throws a 400 error if validation fails
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError;
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw badRequest(`Validation failed: ${errorMessage}`);
    }

    // Replace request body with validated data
    req.body = result.data;
    next();
  };
}

/**
 * Validates query parameters against a Zod schema
 * Throws a 400 error if validation fails
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const error = result.error as ZodError;
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw badRequest(`Query validation failed: ${errorMessage}`);
    }

    // Replace query with validated data
    req.query = result.data as any;
    next();
  };
}

/**
 * Validates route parameters against a Zod schema
 * Throws a 400 error if validation fails
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const error = result.error as ZodError;
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw badRequest(`Parameter validation failed: ${errorMessage}`);
    }

    // Replace params with validated data
    req.params = result.data as any;
    next();
  };
}

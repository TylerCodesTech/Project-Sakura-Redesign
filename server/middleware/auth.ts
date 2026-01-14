import type { Request, Response, NextFunction } from "express";
import { unauthorized } from "./error-handler";

/**
 * Middleware to ensure user is authenticated
 * Checks if req.user exists (set by Passport)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    throw unauthorized("Authentication required");
  }
  next();
}

/**
 * Middleware to ensure user has a specific role
 */
export function requireRole(roleName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const user = req.user as any;
    if (user.role !== roleName && user.role !== "admin") {
      throw unauthorized(`Role '${roleName}' required`);
    }

    next();
  };
}

/**
 * Middleware to check if user has any of the specified roles
 */
export function requireAnyRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const user = req.user as any;
    if (!roles.includes(user.role) && user.role !== "admin") {
      throw unauthorized(`One of these roles required: ${roles.join(", ")}`);
    }

    next();
  };
}

/**
 * Optional auth middleware - doesn't throw error if not authenticated
 * Useful for routes that behave differently for authenticated vs anonymous users
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue - req.user will be set if authenticated, undefined otherwise
  next();
}

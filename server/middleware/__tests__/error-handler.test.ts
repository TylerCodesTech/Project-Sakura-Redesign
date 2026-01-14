import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  ApiError,
  handleAsync,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  serverError,
} from '../error-handler';

describe('ApiError', () => {
  it('should create error with status code and message', () => {
    const error = new ApiError(404, 'Not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('ApiError');
  });
});

describe('Error factory functions', () => {
  it('should create 404 error', () => {
    const error = notFound('Resource not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should create 400 error', () => {
    const error = badRequest('Invalid input');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
  });

  it('should create 401 error', () => {
    const error = unauthorized('Login required');

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Login required');
  });

  it('should create 403 error', () => {
    const error = forbidden('Access denied');

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied');
  });

  it('should create 409 error', () => {
    const error = conflict('Duplicate entry');

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Duplicate entry');
  });

  it('should create 500 error', () => {
    const error = serverError('Something went wrong');

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Something went wrong');
  });

  it('should use default messages', () => {
    expect(notFound().message).toBe('Resource not found');
    expect(badRequest().message).toBe('Bad request');
    expect(unauthorized().message).toBe('Unauthorized');
  });
});

describe('handleAsync', () => {
  it('should handle successful async operations', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const handler = handleAsync(mockFn);

    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await handler(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
  });

  it('should catch and handle ApiError', async () => {
    const mockFn = vi.fn().mockRejectedValue(new ApiError(404, 'Not found'));
    const handler = handleAsync(mockFn);

    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('should handle generic errors with default 500 status', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Something broke'));
    const handler = handleAsync(mockFn);

    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something broke' });
  });

  it('should handle errors without message', async () => {
    const mockFn = vi.fn().mockRejectedValue({});
    const handler = handleAsync(mockFn);

    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

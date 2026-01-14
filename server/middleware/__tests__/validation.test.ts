import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest, validateQuery, validateParams } from '../validation';

describe('validateRequest', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
  });

  it('should pass validation with valid data', () => {
    const middleware = validateRequest(schema);

    const req = {
      body: { name: 'John', age: 30 },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'John', age: 30 });
  });

  it('should throw error with invalid data', () => {
    const middleware = validateRequest(schema);

    const req = {
      body: { name: '', age: -5 },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw error with missing required fields', () => {
    const middleware = validateRequest(schema);

    const req = {
      body: { name: 'John' },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow();
  });

  it('should transform validated data', () => {
    const transformSchema = z.object({
      name: z.string().transform(s => s.toUpperCase()),
      age: z.string().transform(s => parseInt(s)),
    });

    const middleware = validateRequest(transformSchema);

    const req = {
      body: { name: 'john', age: '30' },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(req.body).toEqual({ name: 'JOHN', age: 30 });
    expect(next).toHaveBeenCalled();
  });
});

describe('validateQuery', () => {
  const schema = z.object({
    page: z.string().transform(s => parseInt(s)),
    limit: z.string().transform(s => parseInt(s)),
  });

  it('should pass validation with valid query params', () => {
    const middleware = validateQuery(schema);

    const req = {
      query: { page: '1', limit: '10' },
    } as any;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.query).toEqual({ page: 1, limit: 10 });
  });

  it('should throw error with invalid query params', () => {
    const middleware = validateQuery(schema);

    const req = {
      query: { page: 'invalid' },
    } as any;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow();
  });
});

describe('validateParams', () => {
  const schema = z.object({
    id: z.string().uuid(),
  });

  it('should pass validation with valid params', () => {
    const middleware = validateParams(schema);

    const req = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as any;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw error with invalid params', () => {
    const middleware = validateParams(schema);

    const req = {
      params: { id: 'invalid-uuid' },
    } as any;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow();
  });
});

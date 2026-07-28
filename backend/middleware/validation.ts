/**
 * Luvio Platform — Validation Middleware
 * Uses Zod schemas to validate request bodies.
 */

import { Context, Next } from 'hono';
import { z, ZodSchema } from 'zod';
import type { Env } from '../types';

/**
 * Middleware factory that validates the request JSON body against a Zod schema.
 * On success, the validated data replaces the raw body.
 * On failure, returns a 400 response with detailed validation errors.
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return async (c: Context<Env>, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        return c.json({
          success: false,
          error: 'Validation failed',
          details: errors,
        }, 400);
      }

      // Store validated data in context for downstream handlers
      c.set('validatedBody', result.data);

      await next();
    } catch {
      return c.json({
        success: false,
        error: 'Invalid JSON in request body',
      }, 400);
    }
  };
}

/**
 * Middleware factory that validates query parameters against a Zod schema.
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (c: Context<Env>, next: Next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);

    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return c.json({
        success: false,
        error: 'Invalid query parameters',
        details: errors,
      }, 400);
    }

    c.set('validatedQuery', result.data);
    await next();
  };
}

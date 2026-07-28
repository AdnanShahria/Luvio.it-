/**
 * Luvio Platform — Global Error Handler
 * Catches all unhandled errors and returns structured JSON responses.
 */

import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../types';

export function errorHandler(err: Error, c: Context<Env>) {
  console.error(`[Luvio Error] ${err.message}`, err.stack);

  // Hono HTTP exceptions (already have status codes)
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: err.message,
    }, err.status);
  }

  // Known application errors
  if (err.name === 'ZodError') {
    return c.json({
      success: false,
      error: 'Validation error',
      details: JSON.parse(err.message),
    }, 400);
  }

  // D1 database errors
  if (err.message?.includes('D1_ERROR') || err.message?.includes('UNIQUE constraint failed')) {
    const isUnique = err.message.includes('UNIQUE constraint failed');
    return c.json({
      success: false,
      error: isUnique ? 'A record with this value already exists' : 'Database error',
    }, isUnique ? 409 : 500);
  }

  // Generic server error (don't leak internals in production)
  const isDev = c.env?.NODE_ENV === 'development';
  return c.json({
    success: false,
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  }, 500);
}

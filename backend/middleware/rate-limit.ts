/**
 * Luvio Platform — Rate Limiting Middleware
 * Simple in-memory rate limiter for Cloudflare Workers.
 * Uses a sliding window counter per IP address.
 * 
 * Note: In production with multiple edge locations, consider using
 * Cloudflare's built-in Rate Limiting rules or a Durable Object counter.
 */

import { Context, Next } from 'hono';
import type { Env } from '../types';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (per Worker isolate)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitOptions {
  windowMs?: number;       // Time window in milliseconds (default: 60s)
  maxRequests?: number;    // Max requests per window (default: 60)
  keyPrefix?: string;      // Prefix for the rate limit key
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
  const { windowMs = 60000, maxRequests = 60, keyPrefix = 'global' } = options;

  // Run cleanup every 100 requests
  let requestCount = 0;

  return async (c: Context<Env>, next: Next) => {
    requestCount++;
    if (requestCount % 100 === 0) cleanup();

    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    c.header('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());

    if (entry.count > maxRequests) {
      return c.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        429
      );
    }

    await next();
  };
}

/**
 * Stricter rate limit for auth endpoints (login, register, OTP).
 * 10 requests per minute per IP.
 */
export function authRateLimitMiddleware() {
  return rateLimitMiddleware({
    windowMs: 60000,
    maxRequests: 10,
    keyPrefix: 'auth',
  });
}

/**
 * Very strict rate limit for OTP verification.
 * 5 attempts per 5 minutes per IP.
 */
export function otpRateLimitMiddleware() {
  return rateLimitMiddleware({
    windowMs: 300000,
    maxRequests: 5,
    keyPrefix: 'otp',
  });
}

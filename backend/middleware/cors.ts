/**
 * Luvio Platform — CORS Middleware
 * Configures Cross-Origin Resource Sharing for API endpoints.
 * Allows Flutter apps, web frontend, and dev tools to access the API.
 */

import { cors } from 'hono/cors';
import type { Env } from '../types';

export function corsMiddleware() {
  return cors({
    origin: (origin) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return '*';

      const allowedOrigins = [
        'http://localhost:2222',   // Next.js dev
        'http://localhost:2223',   // Wrangler dev
        'https://luvio.it',       // Production
        'https://www.luvio.it',
      ];

      // Allow any localhost port in development
      if (origin.startsWith('http://localhost:')) return origin;

      // Allow configured origins
      if (allowedOrigins.includes(origin)) return origin;

      // Allow all subdomains of luvio.it
      if (origin.endsWith('.luvio.it')) return origin;

      return undefined; // Deny
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
}

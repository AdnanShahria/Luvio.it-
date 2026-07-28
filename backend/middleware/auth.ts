/**
 * Luvio Platform — Auth Middleware
 * JWT verification middleware for protected routes.
 * Extracts user ID and role from Bearer token and sets context variables.
 */

import { Context, Next } from 'hono';
import type { Env } from '../types';

interface JWTPayload {
  sub: string;    // user ID
  role: string;   // user role
  iat: number;    // issued at
  exp: number;    // expires at
}

/**
 * Verify a JWT token using Web Crypto API (CF Workers compatible)
 */
async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    // Decode payload
    const payload: JWTPayload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify signature using HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    return valid ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Create a JWT token using Web Crypto API
 */
export async function createJWT(
  payload: { sub: string; role: string },
  secret: string,
  expiresIn: string = '7d'
): Promise<string> {
  const encoder = new TextEncoder();

  // Parse expiresIn string (e.g., '7d', '1h', '30m')
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  const multipliers: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };
  const expiresInSeconds = match ? parseInt(match[1]) * (multipliers[match[2]] || 86400) : 604800;

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Auth middleware — requires valid JWT Bearer token.
 * Sets c.get('userId') and c.get('userRole') on success.
 */
export function authMiddleware() {
  return async (c: Context<Env>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, c.env.JWT_SECRET);

    if (!payload) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', payload.sub);
    c.set('userRole', payload.role);

    await next();
  };
}

/**
 * Admin-only middleware — must be chained after authMiddleware.
 */
export function adminMiddleware() {
  return async (c: Context<Env>, next: Next) => {
    const role = c.get('userRole');
    // For now, admin access is determined by a special role.
    // In production, you'd check against an admin users table.
    if (role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }
    await next();
  };
}

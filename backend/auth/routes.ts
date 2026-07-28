/**
 * Luvio Platform — Auth Routes
 * All authentication API endpoints: register, login, OTP, reset, refresh, profile.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { AuthService } from './service';
import { createDb } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authRateLimitMiddleware, otpRateLimitMiddleware } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  setNewPasswordSchema,
  refreshTokenSchema,
} from '@luvio/shared';

const auth = new Hono<Env>();

// Helper: create AuthService from context
function getAuthService(c: any): AuthService {
  const db = createDb(c.env.DB);
  return new AuthService(
    db,
    c.env.JWT_SECRET,
    c.env.REFRESH_TOKEN_SECRET,
    c.env.JWT_EXPIRES_IN || '7d',
    c.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  );
}

// ============================================
// Public Routes (no auth required)
// ============================================

/**
 * POST /api/v1/auth/register
 * Create a new user account.
 */
auth.post('/register',
  authRateLimitMiddleware(),
  validateBody(registerSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const service = getAuthService(c);
      const result = await service.register(body);
      return c.json({ success: true, data: result }, 201);
    } catch (err: any) {
      const status = err.message.includes('already registered') ? 409 : 400;
      return c.json({ success: false, error: err.message }, status);
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Authenticate with email/phone + password.
 */
auth.post('/login',
  authRateLimitMiddleware(),
  validateBody(loginSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const service = getAuthService(c);
      const result = await service.login(body);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      const status = err.message.includes('suspended') ? 403 : 401;
      return c.json({ success: false, error: err.message }, status);
    }
  }
);

/**
 * POST /api/v1/auth/otp/request
 * Send OTP code to phone number.
 */
auth.post('/otp/request',
  otpRateLimitMiddleware(),
  validateBody(requestOtpSchema),
  async (c) => {
    try {
      const { phone } = await c.req.json();
      const service = getAuthService(c);
      const result = await service.requestOTP(phone);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 400);
    }
  }
);

/**
 * POST /api/v1/auth/otp/verify
 * Verify an OTP code.
 */
auth.post('/otp/verify',
  otpRateLimitMiddleware(),
  validateBody(verifyOtpSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const service = getAuthService(c);
      const result = await service.verifyOTP(body.phone, body.code);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 400);
    }
  }
);

/**
 * POST /api/v1/auth/password/reset
 * Request a password reset email.
 */
auth.post('/password/reset',
  authRateLimitMiddleware(),
  validateBody(resetPasswordSchema),
  async (c) => {
    try {
      const { email } = await c.req.json();
      const service = getAuthService(c);
      const result = await service.requestPasswordReset(email);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 400);
    }
  }
);

/**
 * POST /api/v1/auth/password/set
 * Set a new password using a reset token.
 */
auth.post('/password/set',
  authRateLimitMiddleware(),
  validateBody(setNewPasswordSchema),
  async (c) => {
    try {
      const { token, password } = await c.req.json();
      const service = getAuthService(c);
      const result = await service.resetPassword(token, password);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 400);
    }
  }
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using a refresh token.
 */
auth.post('/refresh',
  validateBody(refreshTokenSchema),
  async (c) => {
    try {
      const { refreshToken } = await c.req.json();
      const service = getAuthService(c);
      const result = await service.refreshToken(refreshToken);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 401);
    }
  }
);

// ============================================
// Protected Routes (auth required)
// ============================================

/**
 * GET /api/v1/auth/me
 * Get current user's profile.
 */
auth.get('/me', authMiddleware(), async (c) => {
  try {
    const userId = c.get('userId');
    const service = getAuthService(c);
    const user = await service.getProfile(userId);
    return c.json({ success: true, data: user });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 404);
  }
});

/**
 * DELETE /api/v1/auth/account
 * Delete the authenticated user's account.
 */
auth.delete('/account', authMiddleware(), async (c) => {
  try {
    const userId = c.get('userId');
    const service = getAuthService(c);
    const result = await service.deleteAccount(userId);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

export { auth as authRoutes };

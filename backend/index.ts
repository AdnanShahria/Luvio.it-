/**
 * Luvio Platform — Backend API Entry Point
 * Main Hono application that mounts all domain routers.
 * 
 * API Structure:
 *   /api/v1/auth/*          → Auth (register, login, OTP, etc.)
 *   /api/v1/jobs/*          → Jobs & Services marketplace
 *   /api/v1/marketplace/*   → Community Market (buy/sell/give)
 *   /api/v1/chat/*          → Real-time messaging (+ WebSocket)
 *   /api/v1/wallet/*        → Wallet, payments, escrow
 *   /api/v1/profile/*       → User profiles & avatar upload
 *   /api/v1/notifications/* → Notification center
 *   /api/v1/maps/*          → Geo/location services
 *   /api/v1/premium/*       → Subscriptions & premium features
 *   /api/v1/admin/*         → Admin dashboard API
 *   /api/v1/uploads/*       → R2 file serving (avatars, images, media)
 */

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { rateLimitMiddleware } from './middleware/rate-limit';

// Domain routers
import { authRoutes } from './auth/routes';
import { jobRoutes } from './jobs/routes';
import { marketplaceRoutes } from './marketplace/routes';
import { chatRoutes } from './chat/routes';
import { walletRoutes } from './wallet/routes';
import { profileRoutes } from './profile/routes';
import { notificationRoutes } from './notifications/routes';
import { mapRoutes } from './maps/routes';
import { premiumRoutes } from './premium/routes';
import { adminRoutes } from './admin/routes';
import { uploadRoutes } from './upload/routes';

// Create main app
const app = new Hono<Env>();

// ============================================
// Global Middleware
// ============================================
app.use('*', corsMiddleware());
app.use('*', logger());
app.use('/api/*', rateLimitMiddleware({ windowMs: 60000, maxRequests: 120 }));

// ============================================
// Health Check
// ============================================
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'luvio-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================
// Mount Domain Routers (API v1)
// ============================================
const v1 = new Hono<Env>();

v1.route('/auth', authRoutes);
v1.route('/jobs', jobRoutes);
v1.route('/marketplace', marketplaceRoutes);
v1.route('/chat', chatRoutes);
v1.route('/wallet', walletRoutes);
v1.route('/profile', profileRoutes);
v1.route('/notifications', notificationRoutes);
v1.route('/maps', mapRoutes);
v1.route('/premium', premiumRoutes);
v1.route('/admin', adminRoutes);
v1.route('/uploads', uploadRoutes);

app.route('/api/v1', v1);

// ============================================
// 404 Handler for unknown API routes
// ============================================
app.all('/api/*', (c) => {
  return c.json({
    success: false,
    error: `Route not found: ${c.req.method} ${c.req.path}`,
  }, 404);
});

// ============================================
// Error Handler
// ============================================
app.onError(errorHandler);

export default app;
export type AppType = typeof app;
export { ChatRoom } from './chat/room';

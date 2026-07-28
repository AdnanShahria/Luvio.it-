/**
 * Luvio Platform — Admin Routes (Stub)
 * Phase 4: Owner admin dashboard API.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const admin = new Hono<Env>();

// All admin routes require authentication + admin role
admin.use('*', authMiddleware(), adminMiddleware());

admin.get('/stats', async (c) => {
  return c.json({
    success: true,
    data: {
      totalUsers: 0,
      totalJobs: 0,
      totalListings: 0,
      totalTransactions: 0,
      revenue: 0,
    },
  });
});

admin.get('/users', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

admin.get('/jobs', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

admin.get('/listings', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

admin.get('/payments', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

admin.get('/reports', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

export { admin as adminRoutes };

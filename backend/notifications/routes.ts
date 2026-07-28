/**
 * Luvio Platform — Notifications Routes (Stub)
 * Phase 3: In-app notification center + push notifications.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const notifications = new Hono<Env>();

notifications.get('/', authMiddleware(), async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0, unreadCount: 0 } });
});

notifications.put('/:id/read', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

notifications.put('/read-all', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { notifications as notificationRoutes };

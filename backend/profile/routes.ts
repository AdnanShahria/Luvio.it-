/**
 * Luvio Platform — Profile Routes (Stub)
 * Phase 2: Profile CRUD, avatar upload, role switching.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const profile = new Hono<Env>();

profile.get('/:id', async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

profile.put('/', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

profile.post('/avatar', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

profile.put('/role', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { profile as profileRoutes };

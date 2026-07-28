/**
 * Luvio Platform — Marketplace Routes (Stub)
 * Phase 2: Full listings CRUD + categories + image upload.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const marketplace = new Hono<Env>();

marketplace.get('/', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

marketplace.get('/:id', async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

marketplace.post('/', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { marketplace as marketplaceRoutes };

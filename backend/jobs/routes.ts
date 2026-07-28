/**
 * Luvio Platform — Jobs Routes (Stub)
 * Phase 2: Full CRUD + bidding + hiring flow implementation.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const jobs = new Hono<Env>();

jobs.get('/', async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

jobs.get('/:id', async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

jobs.post('/', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

jobs.post('/:id/bid', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

jobs.post('/:id/hire', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { jobs as jobRoutes };

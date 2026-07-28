/**
 * Luvio Platform — Maps Routes (Stub)
 * Phase 2: Geo queries, nearby search, distance filtering.
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const maps = new Hono<Env>();

maps.get('/nearby/jobs', async (c) => {
  return c.json({ success: true, data: [] });
});

maps.get('/nearby/listings', async (c) => {
  return c.json({ success: true, data: [] });
});

maps.get('/geocode', async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { maps as mapRoutes };

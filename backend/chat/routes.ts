/**
 * Luvio Platform — Chat Routes (Stub)
 * Phase 3: WebSocket Durable Objects + thread management.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const chat = new Hono<Env>();

chat.get('/threads', authMiddleware(), async (c) => {
  return c.json({ success: true, data: [] });
});

chat.get('/threads/:threadId/messages', authMiddleware(), async (c) => {
  return c.json({ success: true, data: [] });
});

chat.post('/threads', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { chat as chatRoutes };

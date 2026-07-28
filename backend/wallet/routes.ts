/**
 * Luvio Platform — Wallet Routes (Stub)
 * Phase 3: Stripe integration, escrow, transaction history.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const wallet = new Hono<Env>();

wallet.get('/', authMiddleware(), async (c) => {
  return c.json({ success: true, data: { balance: 0, currency: 'USD', totalEarnings: 0, totalWithdrawn: 0 } });
});

wallet.get('/transactions', authMiddleware(), async (c) => {
  return c.json({ success: true, data: [], meta: { page: 1, perPage: 20, total: 0 } });
});

wallet.post('/deposit', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

wallet.post('/withdraw', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { wallet as walletRoutes };

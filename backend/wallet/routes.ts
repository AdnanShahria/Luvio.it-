/**
 * Luvio Platform — Wallet Routes
 * Digital wallet: balance, earnings, withdrawals, transaction history.
 *
 * Routes:
 *   GET  /wallet                 — Fetch (or auto-create) wallet for authenticated user
 *   GET  /wallet/transactions    — Paginated transaction history
 *   POST /wallet/deposit         — Initiate deposit (Phase 3: Stripe)
 *   POST /wallet/withdraw        — Request withdrawal (Phase 3: bank/mobile)
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createDb, schema } from '../db';
import { executeWrite } from '../db/router';
import { eq, desc, count } from 'drizzle-orm';

const wallet = new Hono<Env>();

// ============================================
// GET /wallet — Fetch or auto-create wallet
// ============================================

wallet.get('/', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let w = await db.query.wallets.findFirst({ where: eq(schema.wallets.userId, userId) });

  // Auto-create wallet on first access
  if (!w) {
    const newId = crypto.randomUUID();
    await executeWrite(c.env, db.insert(schema.wallets).values({
      id: newId,
      userId,
      balance: 0,
      currency: 'USD',
      totalEarnings: 0,
      totalWithdrawn: 0,
    }));
    w = await db.query.wallets.findFirst({ where: eq(schema.wallets.userId, userId) });
  }

  return c.json({ success: true, data: { wallet: w } });
});

// ============================================
// GET /wallet/transactions — Transaction history
// ============================================

wallet.get('/transactions', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);
  const page    = Math.max(1, parseInt(c.req.query('page')    ?? '1'));
  const perPage = Math.min(50, parseInt(c.req.query('perPage') ?? '20'));
  const offset  = (page - 1) * perPage;

  const w = await db.query.wallets.findFirst({ where: eq(schema.wallets.userId, userId), columns: { id: true } });
  if (!w) return c.json({ success: true, data: [], meta: { page, perPage, total: 0, pages: 0 } });

  const [rows, countResult] = await Promise.all([
    db.query.transactions.findMany({
      where: eq(schema.transactions.walletId, w.id),
      orderBy: [desc(schema.transactions.createdAt)],
      limit: perPage,
      offset,
    }),
    db.select({ total: count(schema.transactions.id) }).from(schema.transactions).where(eq(schema.transactions.walletId, w.id)),
  ]);

  const total = Number(countResult[0]?.total ?? 0);

  return c.json({
    success: true,
    data: rows,
    meta: { page, perPage, total, pages: Math.ceil(total / perPage) },
  });
});

// ============================================
// POST /wallet/deposit — Phase 3 (Stripe)
// ============================================

wallet.post('/deposit', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Payments integration coming in Phase 3' }, 501);
});

// ============================================
// POST /wallet/withdraw — Phase 3 (bank/mobile)
// ============================================

wallet.post('/withdraw', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Withdrawals integration coming in Phase 3' }, 501);
});

export { wallet as walletRoutes };

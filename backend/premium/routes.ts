/**
 * Luvio Platform — Premium Routes (Stub)
 * Phase 4: Subscription tiers, premium badges, featured listings.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const premium = new Hono<Env>();

premium.get('/plans', async (c) => {
  return c.json({
    success: true,
    data: [
      { id: 'free', name: 'Free', price: 0, features: ['Basic listing', 'Standard search'] },
      { id: 'premium', name: 'Premium', price: 9.99, features: ['Premium badge', 'Priority search', 'Unlimited listings'] },
      { id: 'business', name: 'Business', price: 29.99, features: ['Everything in Premium', 'Analytics', 'Featured placement'] },
    ],
  });
});

premium.post('/subscribe', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

premium.delete('/cancel', authMiddleware(), async (c) => {
  return c.json({ success: false, error: 'Not implemented yet' }, 501);
});

export { premium as premiumRoutes };

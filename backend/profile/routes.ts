/**
 * Luvio Platform — Profile Routes
 * Handles user profile viewing, editing, avatar upload, role switching,
 * and the unified dashboard data endpoint.
 *
 * Routes:
 *   GET  /profile/dashboard  — Unified dashboard data (auth required)
 *   GET  /profile/:id        — Public profile by user ID
 *   PUT  /profile/           — Update own profile (name, locale, currency)
 *   POST /profile/avatar     — Upload/replace avatar (multipart/form-data)
 *   PUT  /profile/role       — Switch account role (customer/worker/seller)
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createDb, schema } from '../db';
import { executeWrite } from '../db/router';
import { eq, desc, sql, count } from 'drizzle-orm';
import {
  uploadFile, deleteFile, mimeToExt,
  validateFile, AVATAR_RULES, getWorkerBaseUrl,
} from '../upload/r2';

const profile = new Hono<Env>();

// ============================================
// GET /profile/dashboard — Unified dashboard
// Fires 6 parallel D1 queries and returns a
// single DashboardData payload to the client.
// ============================================

profile.get('/dashboard', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  // Fire all queries concurrently
  const [
    jobsResult,
    listingsResult,
    walletResult,
    txResult,
    notifResult,
    reviewStatsResult,
  ] = await Promise.allSettled([
    // 1. User's own jobs (latest 6)
    db.query.jobs.findMany({
      where: eq(schema.jobs.posterId, userId),
      orderBy: [desc(schema.jobs.createdAt)],
      limit: 6,
    }),

    // 2. User's own listings (latest 6)
    db.query.listings.findMany({
      where: eq(schema.listings.sellerId, userId),
      orderBy: [desc(schema.listings.createdAt)],
      limit: 6,
    }),

    // 3. Wallet
    db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, userId),
    }),

    // 4. Recent transactions (via wallet lookup)
    (async () => {
      const w = await db.query.wallets.findFirst({
        where: eq(schema.wallets.userId, userId),
        columns: { id: true },
      });
      if (!w) return [];
      return db.query.transactions.findMany({
        where: eq(schema.transactions.walletId, w.id),
        orderBy: [desc(schema.transactions.createdAt)],
        limit: 5,
      });
    })(),

    // 5. Notifications (latest 5)
    db.query.notifications.findMany({
      where: eq(schema.notifications.userId, userId),
      orderBy: [desc(schema.notifications.createdAt)],
      limit: 5,
    }),

    // 6. Review stats
    db
      .select({
        avgRating:   sql`ROUND(AVG(${schema.reviews.rating}), 1)`,
        reviewCount: count(schema.reviews.id),
      })
      .from(schema.reviews)
      .where(eq(schema.reviews.revieweeId, userId)),
  ]);

  // Safely unwrap
  const jobs          = jobsResult.status        === 'fulfilled' ? jobsResult.value          : [];
  const listings      = listingsResult.status    === 'fulfilled' ? listingsResult.value      : [];
  const wallet        = walletResult.status      === 'fulfilled' ? (walletResult.value ?? null) : null;
  const transactions  = txResult.status          === 'fulfilled' ? txResult.value            : [];
  const notifications = notifResult.status       === 'fulfilled' ? notifResult.value         : [];
  const reviewStats   = reviewStatsResult.status === 'fulfilled' ? reviewStatsResult.value[0] : null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Accurate totals from DB
  const [jobsTotalRes, listingsTotalRes] = await Promise.allSettled([
    db.select({ total: count(schema.jobs.id) }).from(schema.jobs).where(eq(schema.jobs.posterId, userId)),
    db.select({ total: count(schema.listings.id) }).from(schema.listings).where(eq(schema.listings.sellerId, userId)),
  ]);

  const jobsTotal     = jobsTotalRes.status     === 'fulfilled' ? (Number(jobsTotalRes.value[0]?.total)     || 0) : jobs.length;
  const listingsTotal = listingsTotalRes.status === 'fulfilled' ? (Number(listingsTotalRes.value[0]?.total) || 0) : listings.length;

  return c.json({
    success: true,
    data: {
      jobs,
      listings,
      wallet,
      transactions,
      notifications,
      unreadCount,
      stats: {
        jobsPosted:     jobsTotal,
        jobsDone:       jobs.filter((j) => j.status === 'completed').length,
        listingsCount:  listingsTotal,
        avgRating:      reviewStats?.avgRating    ?? null,
        reviewCount:    Number(reviewStats?.reviewCount)  ?? 0,
        walletBalance:  wallet?.balance           ?? 0,
        walletCurrency: wallet?.currency          ?? 'USD',
      },
    },
  });
});

// ============================================
// GET /profile/:id — Public profile
// ============================================

profile.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env.DB);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
    columns: {
      id: true, displayName: true, avatarUrl: true,
      role: true, locale: true, currency: true,
      isPremium: true, isVerified: true, createdAt: true,
    },
  });

  if (!user) return c.json({ success: false, error: 'User not found' }, 404);

  const [reviewStats] = await db
    .select({
      avgRating:   sql`ROUND(AVG(${schema.reviews.rating}), 1)`,
      reviewCount: count(schema.reviews.id),
    })
    .from(schema.reviews)
    .where(eq(schema.reviews.revieweeId, id));

  return c.json({
    success: true,
    data: {
      ...user,
      avgRating:   reviewStats?.avgRating   ?? null,
      reviewCount: Number(reviewStats?.reviewCount) ?? 0,
    },
  });
});

// ============================================
// PUT /profile/ — Update own profile
// ============================================

profile.put('/', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let body: { displayName?: string; locale?: string; currency?: string };
  try { body = await c.req.json(); }
  catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  const updates: Partial<typeof schema.users.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (body.displayName !== undefined) {
    if (typeof body.displayName !== 'string' || body.displayName.trim().length < 2)
      return c.json({ success: false, error: 'Display name must be at least 2 characters' }, 400);
    updates.displayName = body.displayName.trim();
  }
  if (body.locale   !== undefined) updates.locale   = body.locale;
  if (body.currency !== undefined) updates.currency = body.currency;

  await executeWrite(c.env, db.update(schema.users).set(updates).where(eq(schema.users.id, userId)));

  const updated = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: { id: true, displayName: true, avatarUrl: true, role: true, locale: true, currency: true, isPremium: true, isVerified: true, updatedAt: true },
  });

  return c.json({ success: true, data: updated });
});

// ============================================
// POST /profile/avatar — Upload avatar
// ============================================

profile.post('/avatar', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let formData: FormData;
  try { formData = await c.req.formData(); }
  catch { return c.json({ success: false, error: 'Request must be multipart/form-data' }, 400); }

  const file = formData.get('avatar') as File | null;
  if (!file || !(file instanceof File))
    return c.json({ success: false, error: 'Field "avatar" (file) is required' }, 400);

  const validationError = validateFile(file, AVATAR_RULES);
  if (validationError) return c.json({ success: false, error: validationError.message }, 422);

  const existing = await db.query.users.findFirst({ where: eq(schema.users.id, userId), columns: { avatarUrl: true } });
  if (existing?.avatarUrl) {
    const urlParts = existing.avatarUrl.split('/api/v1/uploads/');
    if (urlParts[1]) await deleteFile(c.env.R2_BUCKET, decodeURIComponent(urlParts[1]));
  }

  const ext     = mimeToExt(file.type);
  const key     = `avatars/${userId}.${ext}`;
  const baseUrl = getWorkerBaseUrl(c.req.url);
  const result  = await uploadFile(c.env, key, file, baseUrl);

  await executeWrite(c.env, db.update(schema.users).set({ avatarUrl: result.url, updatedAt: new Date().toISOString() }).where(eq(schema.users.id, userId)));

  return c.json({ success: true, data: { avatarUrl: result.url, key: result.key, size: result.size, contentType: result.contentType } });
});

// ============================================
// PUT /profile/role — Switch role
// ============================================

profile.put('/role', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let body: { role?: string };
  try { body = await c.req.json(); }
  catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  const validRoles = ['customer', 'worker', 'seller'];
  if (!body.role || !validRoles.includes(body.role))
    return c.json({ success: false, error: `Role must be one of: ${validRoles.join(', ')}` }, 400);

  await executeWrite(c.env, db.update(schema.users).set({ role: body.role as 'customer' | 'worker' | 'seller', updatedAt: new Date().toISOString() }).where(eq(schema.users.id, userId)));

  return c.json({ success: true, data: { role: body.role } });
});

export { profile as profileRoutes };

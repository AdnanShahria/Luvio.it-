/**
 * Luvio Platform — Profile Routes
 * Handles user profile viewing, editing, avatar upload, and role switching.
 *
 * Routes:
 *   GET  /profile/:id       — Get public profile by user ID
 *   PUT  /profile/          — Update own profile (name, locale, currency)
 *   POST /profile/avatar    — Upload/replace profile avatar (multipart/form-data)
 *   PUT  /profile/role      — Switch account role (customer/worker/seller)
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createDb, schema } from '../db';
import { eq } from 'drizzle-orm';
import {
  uploadFile,
  deleteFile,
  mimeToExt,
  validateFile,
  AVATAR_RULES,
  getWorkerBaseUrl,
} from '../upload/r2';

const profile = new Hono<Env>();

// ============================================
// GET /profile/:id — Public profile
// ============================================

profile.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env.DB);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
    columns: {
      id: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      locale: true,
      currency: true,
      isPremium: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({ success: true, data: user });
});

// ============================================
// PUT /profile/ — Update own profile
// ============================================

profile.put('/', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let body: { displayName?: string; locale?: string; currency?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<typeof schema.users.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.displayName !== undefined) {
    if (typeof body.displayName !== 'string' || body.displayName.trim().length < 2) {
      return c.json({ success: false, error: 'Display name must be at least 2 characters' }, 400);
    }
    updates.displayName = body.displayName.trim();
  }

  if (body.locale !== undefined) updates.locale = body.locale;
  if (body.currency !== undefined) updates.currency = body.currency;

  await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));

  const updated = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      id: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      locale: true,
      currency: true,
      isPremium: true,
      isVerified: true,
      updatedAt: true,
    },
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
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ success: false, error: 'Request must be multipart/form-data' }, 400);
  }

  const file = formData.get('avatar') as File | null;
  if (!file || !(file instanceof File)) {
    return c.json({ success: false, error: 'Field "avatar" (file) is required' }, 400);
  }

  // Validate
  const validationError = validateFile(file, AVATAR_RULES);
  if (validationError) {
    return c.json({ success: false, error: validationError.message }, 422);
  }

  // Delete old avatar if it exists
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: { avatarUrl: true },
  });

  if (existing?.avatarUrl) {
    // Extract key from URL: /api/v1/uploads/avatars/{userId}.{ext} → avatars/{userId}.{ext}
    const urlParts = existing.avatarUrl.split('/api/v1/uploads/');
    if (urlParts[1]) {
      await deleteFile(c.env.R2_BUCKET, decodeURIComponent(urlParts[1]));
    }
  }

  // Upload new avatar
  const ext = mimeToExt(file.type);
  const key = `avatars/${userId}.${ext}`;
  const baseUrl = getWorkerBaseUrl(c.req.url);
  const result = await uploadFile(c.env.R2_BUCKET, key, file, baseUrl, c.env.IMGBB_API_KEY);

  // Update user record
  await db
    .update(schema.users)
    .set({ avatarUrl: result.url, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.id, userId));

  return c.json({
    success: true,
    data: {
      avatarUrl: result.url,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    },
  });
});

// ============================================
// PUT /profile/role — Switch role
// ============================================

profile.put('/role', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let body: { role?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const validRoles = ['customer', 'worker', 'seller'];
  if (!body.role || !validRoles.includes(body.role)) {
    return c.json({
      success: false,
      error: `Role must be one of: ${validRoles.join(', ')}`,
    }, 400);
  }

  await db
    .update(schema.users)
    .set({
      role: body.role as 'customer' | 'worker' | 'seller',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.users.id, userId));

  return c.json({ success: true, data: { role: body.role } });
});

export { profile as profileRoutes };

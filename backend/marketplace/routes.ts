/**
 * Luvio Platform — Marketplace Routes
 * Full CRUD for community marketplace listings with R2 image upload.
 * Supports sell and giveaway listing types across 9 categories.
 *
 * Routes:
 *   GET    /marketplace              — List listings (paginated, filterable)
 *   GET    /marketplace/:id          — Get single listing
 *   POST   /marketplace              — Create listing (multipart/form-data, up to 5 images)
 *   PUT    /marketplace/:id          — Update listing (auth, owner only)
 *   DELETE /marketplace/:id          — Delete listing + R2 images (auth, owner only)
 *   PUT    /marketplace/:id/status   — Mark as sold/removed (auth, owner only)
 */

import { Hono } from 'hono';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createDb, schema } from '../db';
import {
  uploadMultipleFiles,
  deleteFolderContents,
  IMAGE_RULES,
  validateFile,
  getWorkerBaseUrl,
} from '../upload/r2';

const marketplace = new Hono<Env>();

const VALID_CATEGORIES = [
  'electronics', 'furniture', 'clothing', 'vehicles',
  'books', 'sports', 'home', 'tools', 'other',
];

const VALID_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'];

// ============================================
// GET /marketplace — List listings
// ============================================

marketplace.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1'));
  const perPage = Math.min(50, parseInt(c.req.query('perPage') ?? '20'));
  const category = c.req.query('category');
  const type = c.req.query('type');
  const offset = (page - 1) * perPage;

  const conditions = [eq(schema.listings.status, 'active')];
  if (category) conditions.push(eq(schema.listings.category, category));
  if (type) conditions.push(eq(schema.listings.type, type as any));

  const [rows, countResult] = await Promise.all([
    db.query.listings.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.listings.createdAt)],
      limit: perPage,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.listings)
      .where(and(...conditions)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return c.json({
    success: true,
    data: rows,
    meta: { page, perPage, total, pages: Math.ceil(total / perPage) },
  });
});

// ============================================
// GET /marketplace/:id — Single listing
// ============================================

marketplace.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env.DB);

  const listing = await db.query.listings.findFirst({
    where: eq(schema.listings.id, id),
  });

  if (!listing) return c.json({ success: false, error: 'Listing not found' }, 404);
  return c.json({ success: true, data: listing });
});

// ============================================
// POST /marketplace — Create listing with images
// ============================================

marketplace.post('/', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ success: false, error: 'Request must be multipart/form-data' }, 400);
  }

  // Parse text fields
  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null;
  const currency = (formData.get('currency') as string) ?? 'USD';
  const category = (formData.get('category') as string)?.trim();
  const condition = (formData.get('condition') as string)?.trim();
  const type = (formData.get('type') as string)?.trim() ?? 'sell';
  const locationName = (formData.get('locationName') as string) ?? null;
  const locationLat = formData.get('locationLat') ? parseFloat(formData.get('locationLat') as string) : null;
  const locationLng = formData.get('locationLng') ? parseFloat(formData.get('locationLng') as string) : null;

  // Validate required fields
  if (!title || title.length < 3) return c.json({ success: false, error: 'Title must be at least 3 characters' }, 400);
  if (!description || description.length < 10) return c.json({ success: false, error: 'Description must be at least 10 characters' }, 400);
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return c.json({ success: false, error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` }, 400);
  }
  if (!condition || !VALID_CONDITIONS.includes(condition)) {
    return c.json({ success: false, error: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}` }, 400);
  }
  if (!['sell', 'giveaway'].includes(type)) {
    return c.json({ success: false, error: 'Type must be "sell" or "giveaway"' }, 400);
  }
  if (type === 'sell' && (!price || isNaN(price) || price <= 0)) {
    return c.json({ success: false, error: 'Price is required for sell listings' }, 400);
  }

  // Collect up to 5 images
  const imageFiles: File[] = [];
  for (let i = 0; i < 5; i++) {
    const f = formData.get(`image_${i}`) as File | null;
    if (f && f instanceof File && f.size > 0) imageFiles.push(f);
  }
  const imagesRaw = formData.getAll('images');
  for (const f of imagesRaw) {
    const file = f as any;
    if (file instanceof File && file.size > 0 && imageFiles.length < 5) imageFiles.push(file);
  }

  // Validate each image
  for (const file of imageFiles) {
    const err = validateFile(file, IMAGE_RULES);
    if (err) return c.json({ success: false, error: err.message }, 422);
  }

  // Generate listing ID for folder name
  const listingId = crypto.randomUUID();

  // Upload images
  const baseUrl = getWorkerBaseUrl(c.req.url);
  let imageUrls: string[] = [];
  if (imageFiles.length > 0) {
    imageUrls = await uploadMultipleFiles(
      c.env.R2_BUCKET,
      `listings/${listingId}`,
      imageFiles,
      baseUrl
    );
  }

  // Insert listing
  await db.insert(schema.listings).values({
    id: listingId,
    sellerId: userId,
    title,
    description,
    images: imageUrls,
    price,
    currency,
    category,
    condition: condition as any,
    type: type as any,
    locationLat,
    locationLng,
    locationName,
    status: 'active',
  });

  const listing = await db.query.listings.findFirst({
    where: eq(schema.listings.id, listingId),
  });
  return c.json({ success: true, data: listing }, 201);
});

// ============================================
// PUT /marketplace/:id — Update listing
// ============================================

marketplace.put('/:id', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const listing = await db.query.listings.findFirst({ where: eq(schema.listings.id, id) });
  if (!listing) return c.json({ success: false, error: 'Listing not found' }, 404);
  if (listing.sellerId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);
  if (listing.status !== 'active') return c.json({ success: false, error: 'Only active listings can be edited' }, 409);

  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  const updates: any = { updatedAt: new Date().toISOString() };
  if (body.title) updates.title = body.title.trim();
  if (body.description) updates.description = body.description.trim();
  if (body.price !== undefined) updates.price = parseFloat(body.price);
  if (body.category && VALID_CATEGORIES.includes(body.category)) updates.category = body.category;
  if (body.condition && VALID_CONDITIONS.includes(body.condition)) updates.condition = body.condition;
  if (body.locationName !== undefined) updates.locationName = body.locationName;

  await db.update(schema.listings).set(updates).where(eq(schema.listings.id, id));

  const updated = await db.query.listings.findFirst({ where: eq(schema.listings.id, id) });
  return c.json({ success: true, data: updated });
});

// ============================================
// DELETE /marketplace/:id — Delete listing + images
// ============================================

marketplace.delete('/:id', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const listing = await db.query.listings.findFirst({ where: eq(schema.listings.id, id) });
  if (!listing) return c.json({ success: false, error: 'Listing not found' }, 404);
  if (listing.sellerId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);

  // Delete all R2 images for this listing
  await deleteFolderContents(c.env.R2_BUCKET, `listings/${id}`);

  // Delete listing row
  await db.delete(schema.listings).where(eq(schema.listings.id, id));

  return c.json({ success: true, data: { deleted: true } });
});

// ============================================
// PUT /marketplace/:id/status — Mark sold/removed
// ============================================

marketplace.put('/:id/status', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const listing = await db.query.listings.findFirst({ where: eq(schema.listings.id, id) });
  if (!listing) return c.json({ success: false, error: 'Listing not found' }, 404);
  if (listing.sellerId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);

  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  const validStatuses = ['active', 'sold', 'removed'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return c.json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` }, 400);
  }

  await db
    .update(schema.listings)
    .set({ status: body.status as any, updatedAt: new Date().toISOString() })
    .where(eq(schema.listings.id, id));

  const updated = await db.query.listings.findFirst({ where: eq(schema.listings.id, id) });
  return c.json({ success: true, data: updated });
});

export { marketplace as marketplaceRoutes };

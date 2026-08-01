/**
 * Luvio Platform — Jobs Routes
 * Full CRUD for job postings, bidding, and hiring flow with R2 image upload.
 *
 * Routes:
 *   GET  /jobs                    — List jobs (paginated, filterable)
 *   GET  /jobs/:id                — Get single job with bids
 *   POST /jobs                    — Create job (multipart/form-data with up to 5 images)
 *   PUT  /jobs/:id                — Update job (auth, owner only)
 *   DELETE /jobs/:id              — Delete job + R2 images (auth, owner only)
 *   POST /jobs/:id/bid            — Submit a bid (auth, worker only)
 *   PUT  /jobs/:id/bids/:bidId    — Accept or reject a bid (auth, poster only)
 *   POST /jobs/:id/hire           — Hire a worker directly (auth, poster only)
 *   POST /jobs/:id/complete       — Mark job as completed (auth, poster only)
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

const jobs = new Hono<Env>();

// ============================================
// GET /jobs — List jobs
// ============================================

jobs.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1'));
  const perPage = Math.min(50, parseInt(c.req.query('perPage') ?? '20'));
  const category = c.req.query('category');
  const status = c.req.query('status') ?? 'open';
  const offset = (page - 1) * perPage;

  const conditions = [eq(schema.jobs.status, status as any)];
  if (category) conditions.push(eq(schema.jobs.category, category));

  const [rows, countResult] = await Promise.all([
    db.query.jobs.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.jobs.createdAt)],
      limit: perPage,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.jobs)
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
// GET /jobs/:id — Single job
// ============================================

jobs.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env.DB);

  const job = await db.query.jobs.findFirst({
    where: eq(schema.jobs.id, id),
    with: { bids: true },
  });

  if (!job) return c.json({ success: false, error: 'Job not found' }, 404);
  return c.json({ success: true, data: job });
});

// ============================================
// POST /jobs — Create job with images
// ============================================

jobs.post('/', authMiddleware(), async (c) => {
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
  const budget = parseFloat(formData.get('budget') as string);
  const currency = (formData.get('currency') as string) ?? 'USD';
  const paymentMode = (formData.get('paymentMode') as string) ?? 'escrow';
  const category = (formData.get('category') as string)?.trim();
  const locationName = (formData.get('locationName') as string) ?? null;
  const locationLat = formData.get('locationLat') ? parseFloat(formData.get('locationLat') as string) : null;
  const locationLng = formData.get('locationLng') ? parseFloat(formData.get('locationLng') as string) : null;

  // Validate required fields
  if (!title || title.length < 5) return c.json({ success: false, error: 'Title must be at least 5 characters' }, 400);
  if (!description || description.length < 20) return c.json({ success: false, error: 'Description must be at least 20 characters' }, 400);
  if (isNaN(budget) || budget <= 0) return c.json({ success: false, error: 'Budget must be a positive number' }, 400);
  if (!category) return c.json({ success: false, error: 'Category is required' }, 400);
  if (!['escrow', 'cash', 'wallet'].includes(paymentMode)) return c.json({ success: false, error: 'Invalid payment mode' }, 400);

  // Collect up to 5 images
  const imageFiles: File[] = [];
  for (let i = 0; i < 5; i++) {
    const f = formData.get(`image_${i}`) as File | null;
    if (f && f instanceof File && f.size > 0) imageFiles.push(f);
  }
  // Also support the generic "images" array key
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

  // Generate job ID for folder name
  const jobId = crypto.randomUUID();

  // Upload images
  const baseUrl = getWorkerBaseUrl(c.req.url);
  let imageUrls: string[] = [];
  if (imageFiles.length > 0) {
    imageUrls = await uploadMultipleFiles(
      c.env.R2_BUCKET,
      `jobs/${jobId}`,
      imageFiles,
      baseUrl,
      c.env.IMGBB_API_KEY
    );
  }

  // Insert job
  await db.insert(schema.jobs).values({
    id: jobId,
    posterId: userId,
    title,
    description,
    images: imageUrls,
    budget,
    currency,
    paymentMode: paymentMode as any,
    category,
    locationLat,
    locationLng,
    locationName,
    status: 'open',
  });

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, jobId) });
  return c.json({ success: true, data: job }, 201);
});

// ============================================
// PUT /jobs/:id — Update job
// ============================================

jobs.put('/:id', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404);
  if (job.posterId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);
  if (job.status !== 'open') return c.json({ success: false, error: 'Only open jobs can be edited' }, 409);

  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  const updates: any = { updatedAt: new Date().toISOString() };
  if (body.title) updates.title = body.title.trim();
  if (body.description) updates.description = body.description.trim();
  if (body.budget) updates.budget = parseFloat(body.budget);
  if (body.category) updates.category = body.category;
  if (body.locationName !== undefined) updates.locationName = body.locationName;

  await db.update(schema.jobs).set(updates).where(eq(schema.jobs.id, id));

  const updated = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  return c.json({ success: true, data: updated });
});

// ============================================
// DELETE /jobs/:id — Delete job + images
// ============================================

jobs.delete('/:id', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404);
  if (job.posterId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);

  // Delete R2 images
  await deleteFolderContents(c.env.R2_BUCKET, `jobs/${id}`);

  // Delete job (cascades bids)
  await db.delete(schema.jobs).where(eq(schema.jobs.id, id));

  return c.json({ success: true, data: { deleted: true } });
});

// ============================================
// POST /jobs/:id/bid — Submit a bid
// ============================================

jobs.post('/:id/bid', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404);
  if (job.status !== 'open') return c.json({ success: false, error: 'Job is no longer open for bids' }, 409);
  if (job.posterId === userId) return c.json({ success: false, error: 'You cannot bid on your own job' }, 400);

  let body: { amount?: number; message?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  if (!body.amount || isNaN(body.amount) || body.amount <= 0) {
    return c.json({ success: false, error: 'Bid amount must be a positive number' }, 400);
  }
  if (!body.message || body.message.trim().length < 10) {
    return c.json({ success: false, error: 'Bid message must be at least 10 characters' }, 400);
  }

  // Check for existing bid
  const existing = await db.query.bids.findFirst({
    where: and(eq(schema.bids.jobId, id), eq(schema.bids.workerId, userId)),
  });
  if (existing) return c.json({ success: false, error: 'You have already bid on this job' }, 409);

  const bidId = crypto.randomUUID();
  await db.insert(schema.bids).values({
    id: bidId,
    jobId: id,
    workerId: userId,
    amount: body.amount,
    message: body.message.trim(),
    status: 'pending',
  });

  const bid = await db.query.bids.findFirst({ where: eq(schema.bids.id, bidId) });
  return c.json({ success: true, data: bid }, 201);
});

// ============================================
// PUT /jobs/:id/bids/:bidId — Accept or reject a bid
// ============================================

jobs.put('/:id/bids/:bidId', authMiddleware(), async (c) => {
  const { id, bidId } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404);
  if (job.posterId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);

  const bid = await db.query.bids.findFirst({ where: eq(schema.bids.id, bidId) });
  if (!bid || bid.jobId !== id) return c.json({ success: false, error: 'Bid not found' }, 404);

  let body: { action?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON body' }, 400); }

  const action = body.action;
  if (!action || !['accept', 'reject'].includes(action)) {
    return c.json({ success: false, error: 'Action must be "accept" or "reject"' }, 400);
  }

  if (action === 'accept') {
    // Accept this bid and reject others
    await db.update(schema.bids).set({ status: 'accepted' }).where(eq(schema.bids.id, bidId));
    await db
      .update(schema.bids)
      .set({ status: 'rejected' })
      .where(and(eq(schema.bids.jobId, id), sql`id != ${bidId}`));

    // Update job status and assign worker
    await db
      .update(schema.jobs)
      .set({ status: 'in_progress', hiredWorkerId: bid.workerId, updatedAt: new Date().toISOString() })
      .where(eq(schema.jobs.id, id));
  } else {
    await db.update(schema.bids).set({ status: 'rejected' }).where(eq(schema.bids.id, bidId));
  }

  const updatedBid = await db.query.bids.findFirst({ where: eq(schema.bids.id, bidId) });
  return c.json({ success: true, data: updatedBid });
});

// ============================================
// POST /jobs/:id/complete — Mark job completed
// ============================================

jobs.post('/:id/complete', authMiddleware(), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404);
  if (job.posterId !== userId) return c.json({ success: false, error: 'Forbidden' }, 403);
  if (job.status !== 'in_progress') {
    return c.json({ success: false, error: 'Only in-progress jobs can be completed' }, 409);
  }

  await db
    .update(schema.jobs)
    .set({ status: 'completed', updatedAt: new Date().toISOString() })
    .where(eq(schema.jobs.id, id));

  const updated = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  return c.json({ success: true, data: updated });
});

export { jobs as jobRoutes };

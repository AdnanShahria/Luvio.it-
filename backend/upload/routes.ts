/**
 * Luvio Platform — Upload Serve Routes
 * Streams R2 objects to clients via the Worker.
 * Public access on the bucket is intentionally DISABLED —
 * all file serving goes through this endpoint.
 *
 * Routes:
 *   GET /api/v1/uploads/:folder/:filename        — serve flat files (e.g. avatars)
 *   GET /api/v1/uploads/:folder/:subfolder/:filename — serve nested files (e.g. jobs/id/0.jpg)
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { serveFile } from './r2';

const upload = new Hono<Env>();

/**
 * GET /api/v1/uploads/:folder/:filename
 * Serves avatars: avatars/{userId}.jpg
 */
upload.get('/:folder/:filename', async (c) => {
  const { folder, filename } = c.req.param();

  // Security: disallow path traversal
  if (folder.includes('..') || filename.includes('..')) {
    return c.json({ success: false, error: 'Invalid path' }, 400);
  }

  const key = `${folder}/${filename}`;
  const response = await serveFile(c.env.R2_BUCKET, key);

  if (!response) {
    return c.json({ success: false, error: 'File not found' }, 404);
  }

  return response;
});

/**
 * GET /api/v1/uploads/:folder/:subfolder/:filename
 * Serves nested files: jobs/{jobId}/0.jpg, listings/{listingId}/1.png, chat/{threadId}/{fileId}.mp4
 */
upload.get('/:folder/:subfolder/:filename', async (c) => {
  const { folder, subfolder, filename } = c.req.param();

  // Security: disallow path traversal
  if ([folder, subfolder, filename].some((s) => s.includes('..'))) {
    return c.json({ success: false, error: 'Invalid path' }, 400);
  }

  const key = `${folder}/${subfolder}/${filename}`;
  const response = await serveFile(c.env.R2_BUCKET, key);

  if (!response) {
    return c.json({ success: false, error: 'File not found' }, 404);
  }

  return response;
});

export { upload as uploadRoutes };

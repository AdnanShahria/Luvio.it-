/**
 * Luvio Platform — Chat Routes
 * WebSocket thread management and media uploads for the chat system.
 *
 * Routes:
 *   GET  /chat/threads                          — List user's chat threads
 *   POST /chat/threads                          — Create a chat thread
 *   GET  /chat/threads/:threadId/messages       — Get messages in a thread
 *   POST /chat/threads/:threadId/media          — Upload a media file to a thread (→ R2)
 *   GET  /chat/threads/:threadId/ws             — Upgrade to WebSocket (Durable Object)
 */

import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createDb, schema } from '../db';
import {
  uploadFile,
  validateFile,
  mimeToExt,
  CHAT_MEDIA_RULES,
  getWorkerBaseUrl,
} from '../upload/r2';

const chat = new Hono<Env>();

// ============================================
// GET /chat/threads — List user's threads
// ============================================

chat.get('/threads', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  // Find all threads where the user is a participant
  const participantRows = await db.query.chatParticipants.findMany({
    where: eq(schema.chatParticipants.userId, userId),
    with: {
      thread: {
        with: {
          participants: {
            with: { user: { columns: { id: true, displayName: true, avatarUrl: true } } },
          },
        },
      },
    },
    orderBy: [desc(schema.chatParticipants.joinedAt)],
  });

  const threads = participantRows.map((p) => p.thread);
  return c.json({ success: true, data: threads });
});

// ============================================
// POST /chat/threads — Create a thread
// ============================================

chat.post('/threads', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  let body: { type?: string; referenceId?: string; participantIds?: string[] };
  try { body = await c.req.json(); } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const validTypes = ['job', 'listing', 'direct'];
  if (!body.type || !validTypes.includes(body.type)) {
    return c.json({ success: false, error: `Thread type must be one of: ${validTypes.join(', ')}` }, 400);
  }

  if (!body.participantIds || body.participantIds.length === 0) {
    return c.json({ success: false, error: 'At least one participant ID is required' }, 400);
  }

  const threadId = crypto.randomUUID();

  // Create thread
  await db.insert(schema.chatThreads).values({
    id: threadId,
    type: body.type as any,
    referenceId: body.referenceId ?? null,
  });

  // Add creator + all specified participants
  const participantSet = new Set([userId, ...body.participantIds]);
  for (const pUserId of participantSet) {
    await db.insert(schema.chatParticipants).values({
      id: crypto.randomUUID(),
      threadId,
      userId: pUserId,
    });
  }

  const thread = await db.query.chatThreads.findFirst({
    where: eq(schema.chatThreads.id, threadId),
    with: { participants: true },
  });

  return c.json({ success: true, data: thread }, 201);
});

// ============================================
// GET /chat/threads/:threadId/messages — Thread messages
// ============================================

chat.get('/threads/:threadId/messages', authMiddleware(), async (c) => {
  const { threadId } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1'));
  const perPage = Math.min(100, parseInt(c.req.query('perPage') ?? '50'));
  const offset = (page - 1) * perPage;

  // Check user is a participant
  const participant = await db.query.chatParticipants.findFirst({
    where: eq(schema.chatParticipants.threadId, threadId) &&
           eq(schema.chatParticipants.userId, userId) as any,
  });

  if (!participant) {
    return c.json({ success: false, error: 'Not a participant in this thread' }, 403);
  }

  const messages = await db.query.chatMessages.findMany({
    where: eq(schema.chatMessages.threadId, threadId),
    orderBy: [desc(schema.chatMessages.createdAt)],
    limit: perPage,
    offset,
    with: {
      sender: { columns: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  return c.json({ success: true, data: messages.reverse() });
});

// ============================================
// POST /chat/threads/:threadId/media — Upload media
// ============================================

chat.post('/threads/:threadId/media', authMiddleware(), async (c) => {
  const { threadId } = c.req.param();
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  // Check user is a participant
  const participant = await db.query.chatParticipants.findFirst({
    where: eq(schema.chatParticipants.threadId, threadId) &&
           eq(schema.chatParticipants.userId, userId) as any,
  });

  if (!participant) {
    return c.json({ success: false, error: 'Not a participant in this thread' }, 403);
  }

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ success: false, error: 'Request must be multipart/form-data' }, 400);
  }

  const file = formData.get('file') as File | null;
  if (!file || !(file instanceof File)) {
    return c.json({ success: false, error: 'Field "file" is required' }, 400);
  }

  // Validate
  const validationError = validateFile(file, CHAT_MEDIA_RULES);
  if (validationError) {
    return c.json({ success: false, error: validationError.message }, 422);
  }

  // Upload to R2
  const fileId = crypto.randomUUID();
  const ext = mimeToExt(file.type);
  const key = `chat/${threadId}/${fileId}.${ext}`;
  const baseUrl = getWorkerBaseUrl(c.req.url);
  const result = await uploadFile(c.env.R2_BUCKET, key, file, baseUrl);

  return c.json({
    success: true,
    data: {
      url: result.url,
      key: result.key,
      contentType: result.contentType,
      size: result.size,
      fileName: file.name,
    },
  }, 201);
});

// ============================================
// GET /chat/threads/:threadId/ws — WebSocket upgrade
// ============================================

chat.get('/threads/:threadId/ws', authMiddleware(), async (c) => {
  const { threadId } = c.req.param();
  const upgradeHeader = c.req.header('Upgrade');

  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return c.json({ success: false, error: 'Expected WebSocket upgrade' }, 426);
  }

  // Route to Durable Object
  const id = c.env.CHAT_ROOM.idFromName(threadId);
  const stub = c.env.CHAT_ROOM.get(id);

  return stub.fetch(c.req.raw);
});

export { chat as chatRoutes };

/**
 * Luvio Platform — Notifications Routes
 * In-app notification center with unread counts and mark-as-read flows.
 *
 * Routes:
 *   GET  /notifications          — List notifications (paginated, unreadCount)
 *   PUT  /notifications/read-all — Mark all as read
 *   PUT  /notifications/:id/read — Mark single notification as read
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createDb, schema } from '../db';
import { executeWrite } from '../db/router';
import { eq, desc, count, and } from 'drizzle-orm';

const notifications = new Hono<Env>();

// ============================================
// GET /notifications — Paginated list
// ============================================

notifications.get('/', authMiddleware(), async (c) => {
  const userId  = c.get('userId');
  const db      = createDb(c.env.DB);
  const page    = Math.max(1, parseInt(c.req.query('page')    ?? '1'));
  const perPage = Math.min(50, parseInt(c.req.query('perPage') ?? '20'));
  const offset  = (page - 1) * perPage;

  const [rows, totalResult, unreadResult] = await Promise.all([
    db.query.notifications.findMany({
      where: eq(schema.notifications.userId, userId),
      orderBy: [desc(schema.notifications.createdAt)],
      limit: perPage,
      offset,
    }),
    db.select({ total: count(schema.notifications.id) })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId)),
    db.select({ unread: count(schema.notifications.id) })
      .from(schema.notifications)
      .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.isRead, false))),
  ]);

  const total      = Number(totalResult[0]?.total  ?? 0);
  const unreadCount = Number(unreadResult[0]?.unread ?? 0);

  return c.json({
    success: true,
    data: rows,
    meta: { page, perPage, total, pages: Math.ceil(total / perPage), unreadCount },
  });
});

// ============================================
// PUT /notifications/read-all — Mark all read
// ============================================

notifications.put('/read-all', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const db     = createDb(c.env.DB);

  await executeWrite(
    c.env,
    db.update(schema.notifications)
      .set({ isRead: true })
      .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.isRead, false))),
  );

  return c.json({ success: true, message: 'All notifications marked as read' });
});

// ============================================
// PUT /notifications/:id/read — Mark one read
// ============================================

notifications.put('/:id/read', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const db     = createDb(c.env.DB);

  const notif = await db.query.notifications.findFirst({
    where: and(eq(schema.notifications.id, id), eq(schema.notifications.userId, userId)),
  });

  if (!notif) return c.json({ success: false, error: 'Notification not found' }, 404);

  await executeWrite(c.env, db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.id, id)));

  return c.json({ success: true, message: 'Notification marked as read' });
});

export { notifications as notificationRoutes };

/**
 * Luvio Platform — Database Schema (Drizzle ORM + Cloudflare D1)
 * All tables defined here. Drizzle generates migrations from this.
 */

import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Helper: generate CUID-like ID
const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const timestamp = (name: string) => text(name).$defaultFn(() => new Date().toISOString());

// ============================================
// USERS & AUTH
// ============================================

export const users = sqliteTable('users', {
  id: id(),
  email: text('email').unique(),
  phone: text('phone').unique(),
  phoneCountryCode: text('phone_country_code'),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['customer', 'worker', 'seller'] }).notNull().default('customer'),
  locale: text('locale').notNull().default('en'),
  currency: text('currency').notNull().default('USD'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  isBlocked: integer('is_blocked', { mode: 'boolean' }).notNull().default(false),
  lastLoginAt: text('last_login_at'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  phoneIdx: index('idx_users_phone').on(table.phone),
}));

export const otpCodes = sqliteTable('otp_codes', {
  id: id(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: text('expires_at').notNull(),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at'),
});

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: timestamp('created_at'),
}, (table) => ({
  tokenIdx: index('idx_refresh_tokens_token').on(table.token),
  userIdx: index('idx_refresh_tokens_user').on(table.userId),
}));

// ============================================
// JOBS & BIDS
// ============================================

export const jobs = sqliteTable('jobs', {
  id: id(),
  posterId: text('poster_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  images: text('images', { mode: 'json' }).$type<string[]>().notNull().default([]),
  budget: real('budget').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentMode: text('payment_mode', { enum: ['escrow', 'cash', 'wallet'] }).notNull().default('escrow'),
  category: text('category').notNull(),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationName: text('location_name'),
  status: text('status', { enum: ['open', 'in_progress', 'completed', 'cancelled'] }).notNull().default('open'),
  hiredWorkerId: text('hired_worker_id').references(() => users.id),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  posterIdx: index('idx_jobs_poster').on(table.posterId),
  statusIdx: index('idx_jobs_status').on(table.status),
  categoryIdx: index('idx_jobs_category').on(table.category),
}));

export const bids = sqliteTable('bids', {
  id: id(),
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  workerId: text('worker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'withdrawn'] }).notNull().default('pending'),
  createdAt: timestamp('created_at'),
}, (table) => ({
  jobIdx: index('idx_bids_job').on(table.jobId),
  workerIdx: index('idx_bids_worker').on(table.workerId),
}));

// ============================================
// MARKETPLACE LISTINGS
// ============================================

export const listings = sqliteTable('listings', {
  id: id(),
  sellerId: text('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  images: text('images', { mode: 'json' }).$type<string[]>().notNull().default([]),
  price: real('price'),
  currency: text('currency').notNull().default('USD'),
  category: text('category').notNull(),
  condition: text('condition', { enum: ['new', 'like_new', 'good', 'fair', 'poor'] }).notNull(),
  type: text('type', { enum: ['sell', 'giveaway'] }).notNull().default('sell'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationName: text('location_name'),
  status: text('status', { enum: ['active', 'sold', 'removed'] }).notNull().default('active'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  sellerIdx: index('idx_listings_seller').on(table.sellerId),
  categoryIdx: index('idx_listings_category').on(table.category),
  statusIdx: index('idx_listings_status').on(table.status),
}));

// ============================================
// CHAT
// ============================================

export const chatThreads = sqliteTable('chat_threads', {
  id: id(),
  type: text('type', { enum: ['job', 'listing', 'direct'] }).notNull(),
  referenceId: text('reference_id'),
  createdAt: timestamp('created_at'),
});

export const chatParticipants = sqliteTable('chat_participants', {
  id: id(),
  threadId: text('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at'),
}, (table) => ({
  threadIdx: index('idx_chat_participants_thread').on(table.threadId),
  userIdx: index('idx_chat_participants_user').on(table.userId),
}));

export const chatMessages = sqliteTable('chat_messages', {
  id: id(),
  threadId: text('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: timestamp('created_at'),
}, (table) => ({
  threadIdx: index('idx_chat_messages_thread').on(table.threadId),
}));

// ============================================
// WALLET & TRANSACTIONS
// ============================================

export const wallets = sqliteTable('wallets', {
  id: id(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  totalEarnings: real('total_earnings').notNull().default(0),
  totalWithdrawn: real('total_withdrawn').notNull().default(0),
  createdAt: timestamp('created_at'),
});

export const transactions = sqliteTable('transactions', {
  id: id(),
  walletId: text('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'payment', 'refund'] }).notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'cancelled'] }).notNull().default('pending'),
  description: text('description'),
  referenceType: text('reference_type'),
  referenceId: text('reference_id'),
  createdAt: timestamp('created_at'),
}, (table) => ({
  walletIdx: index('idx_transactions_wallet').on(table.walletId),
}));

export const escrowHolds = sqliteTable('escrow_holds', {
  id: id(),
  jobId: text('job_id').notNull().references(() => jobs.id),
  payerId: text('payer_id').notNull().references(() => users.id),
  payeeId: text('payee_id').notNull().references(() => users.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['held', 'released', 'disputed', 'refunded'] }).notNull().default('held'),
  createdAt: timestamp('created_at'),
  releasedAt: text('released_at'),
});

// ============================================
// REVIEWS
// ============================================

export const reviews = sqliteTable('reviews', {
  id: id(),
  reviewerId: text('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  revieweeId: text('reviewee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('job_id').references(() => jobs.id),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at'),
}, (table) => ({
  revieweeIdx: index('idx_reviews_reviewee').on(table.revieweeId),
}));

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = sqliteTable('notifications', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['bid_received', 'bid_accepted', 'job_completed', 'new_message', 'payment_received', 'system'] }).notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at'),
}, (table) => ({
  userIdx: index('idx_notifications_user').on(table.userId),
  readIdx: index('idx_notifications_read').on(table.userId, table.isRead),
}));

// ============================================
// SUBSCRIPTIONS (PREMIUM)
// ============================================

export const subscriptions = sqliteTable('subscriptions', {
  id: id(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['free', 'premium', 'business'] }).notNull().default('free'),
  status: text('status', { enum: ['active', 'cancelled', 'expired', 'past_due'] }).notNull().default('active'),
  stripeSubId: text('stripe_sub_id'),
  expiresAt: text('expires_at'),
  createdAt: timestamp('created_at'),
});

// ============================================
// REPORTS & BLOCKS (SAFETY)
// ============================================

export const reports = sqliteTable('reports', {
  id: id(),
  reporterId: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type', { enum: ['user', 'job', 'listing', 'message'] }).notNull(),
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'reviewed', 'resolved', 'dismissed'] }).notNull().default('pending'),
  createdAt: timestamp('created_at'),
});

export const blocks = sqliteTable('blocks', {
  id: id(),
  blockerId: text('blocker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: text('blocked_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at'),
}, (table) => ({
  blockerIdx: index('idx_blocks_blocker').on(table.blockerId),
}));

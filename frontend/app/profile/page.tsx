'use client';

/**
 * Luvio Platform — User Dashboard
 *
 * Architecture:
 *  - Single API call: GET /api/v1/profile/dashboard
 *  - Parallel D1 queries on the backend (jobs, listings, wallet, txns, notifications)
 *  - Client renders shimmer skeletons while loading, then animates in data
 *
 * Sections:
 *  1. Profile Hero (gradient banner, avatar, badges, quick icon buttons)
 *  2. Stats Row (5 KPI cards with animated values)
 *  3. Quick Actions (8 pill cards with Lucide icons)
 *  4. Tab Navigation (Overview / Jobs / Market / Wallet)
 *  5. Two-column layout (feed left, sidebar right)
 *     Left:  My Jobs, My Listings, Recent Transactions
 *     Right: Wallet Card, Notifications, Premium CTA, Account Links
 *
 * Responsive:
 *  - Mobile  (<640px)  — single column, 2×2 stats, 4-col action grid
 *  - Tablet  (<900px)  — single column, stats wrap, full action grid
 *  - Laptop (≥900px)  — two-column, 5-stat row, 8-col action grid
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { Header, MobileNav, RequireAuth } from '@/components/layout';
import type { Job, Listing, Wallet, Transaction, AppNotification } from '@luvio/shared';
import {
  // Navigation & Actions
  Plus, ChevronRight, RefreshCw, ExternalLink,
  // Feature icons
  Briefcase, ShoppingBag, Wallet as WalletIcon, Bell, Star,
  MapPin, MessageCircle, Settings, LogOut, Crown, Zap,
  CheckCircle2, Clock, CircleDollarSign, Package, Eye,
  // Analytics
  TrendingUp, Award, BarChart3, Shield,
  // Status
  AlertCircle, ArrowUpRight, ArrowDownLeft, Lock, Unlock,
  // User
  User, BadgeCheck,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardStats {
  jobsPosted:     number;
  jobsDone:       number;
  listingsCount:  number;
  avgRating:      number | null;
  reviewCount:    number;
  walletBalance:  number;
  walletCurrency: string;
}

interface DashboardData {
  jobs:          Job[];
  listings:      Listing[];
  wallet:        Wallet | null;
  transactions:  Transaction[];
  notifications: AppNotification[];
  unreadCount:   number;
  stats:         DashboardStats;
}

type Tab = 'overview' | 'jobs' | 'market' | 'wallet';

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Component
// ─────────────────────────────────────────────────────────────────────────────

function Sk({ w = '100%', h = '14px', r = '8px', style = {} }: {
  w?: string; h?: string; r?: string; style?: React.CSSProperties;
}) {
  return (
    <span style={{
      display: 'block', width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #ede9fe 0%, #e0e7ff 40%, #ede9fe 80%)',
      backgroundSize: '300% 100%', animation: 'sk-shimmer 1.6s ease-in-out infinite',
      ...style,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated Number
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    const duration = 700;
    const from = 0;
    const to   = value;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return (
    <>{prefix}{display.toFixed(decimals)}{suffix}</>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, prefix = '', suffix = '', decimals = 0, color, bg, loading }: {
  icon: React.ReactNode; label: string; value: number;
  prefix?: string; suffix?: string; decimals?: number;
  color: string; bg: string; loading?: boolean;
}) {
  return (
    <div className="stat-card" style={{ '--accent': color, '--accent-bg': bg } as React.CSSProperties}>
      <div className="stat-icon">{icon}</div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <Sk w="55%" h="26px" r="6px" />
          <Sk w="75%" h="11px" r="4px" />
        </div>
      ) : (
        <div>
          <div className="stat-value">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </div>
          <div className="stat-label">{label}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action
// ─────────────────────────────────────────────────────────────────────────────

function QuickAction({ icon, label, href, color, bg }: {
  icon: React.ReactNode; label: string; href: string; color: string; bg: string;
}) {
  return (
    <Link href={href} className="quick-action" style={{ '--qa-color': color, '--qa-bg': bg } as React.CSSProperties}>
      <div className="qa-icon">{icon}</div>
      <span className="qa-label">{label}</span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Status config
// ─────────────────────────────────────────────────────────────────────────────

const JOB_STATUS = {
  open:        { label: 'Open',        color: '#2563eb', bg: '#eff6ff', icon: <AlertCircle size={11} /> },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', icon: <Clock size={11} /> },
  completed:   { label: 'Completed',   color: '#059669', bg: '#ecfdf5', icon: <CheckCircle2 size={11} /> },
  cancelled:   { label: 'Cancelled',   color: '#dc2626', bg: '#fef2f2', icon: <AlertCircle size={11} /> },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Job Row
// ─────────────────────────────────────────────────────────────────────────────

function JobRow({ job }: { job: Job }) {
  const s = JOB_STATUS[job.status as keyof typeof JOB_STATUS] ?? JOB_STATUS.open;
  return (
    <Link href={`/jobs/${job.id}`} className="feed-row">
      <div className="feed-thumb" style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}>
        {job.images?.[0]
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={job.images[0]} alt={job.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
          : <Briefcase size={20} color="#6366f1" />}
      </div>
      <div className="feed-body">
        <div className="feed-title">{job.title}</div>
        <div className="feed-meta">
          {job.locationName && <><MapPin size={11} />{job.locationName} &middot; </>}
          <Clock size={11} />{new Date(job.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className="feed-aside">
        <span className="feed-price">
          {job.currency}&nbsp;{job.budget.toLocaleString()}
        </span>
        <span className="status-chip" style={{ color: s.color, background: s.bg }}>
          {s.icon}&nbsp;{s.label}
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Listing Row
// ─────────────────────────────────────────────────────────────────────────────

function ListingRow({ listing }: { listing: Listing }) {
  const isGiveaway = listing.type === 'giveaway';
  return (
    <Link href={`/marketplace/${listing.id}`} className="feed-row feed-row--orange">
      <div className="feed-thumb" style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)' }}>
        {listing.images?.[0]
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
          : <ShoppingBag size={20} color="#f97316" />}
      </div>
      <div className="feed-body">
        <div className="feed-title">{listing.title}</div>
        <div className="feed-meta">
          <span className="feed-badge">{listing.category}</span>
          &nbsp;&middot;&nbsp;{listing.condition.replace('_', ' ')}
        </div>
      </div>
      <div className="feed-aside">
        <span className="feed-price" style={{ color: isGiveaway ? '#10b981' : '#f97316' }}>
          {isGiveaway ? 'Free' : `${listing.currency} ${listing.price?.toLocaleString()}`}
        </span>
        <span className="status-chip" style={{ color: isGiveaway ? '#059669' : '#f97316', background: isGiveaway ? '#ecfdf5' : '#fff7ed' }}>
          {isGiveaway ? 'Giveaway' : 'For Sale'}
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Row
// ─────────────────────────────────────────────────────────────────────────────

const TX_META: Record<string, { icon: React.ReactNode; positive: boolean }> = {
  deposit:        { icon: <ArrowDownLeft  size={16} />, positive: true  },
  escrow_release: { icon: <Unlock         size={16} />, positive: true  },
  withdrawal:     { icon: <ArrowUpRight   size={16} />, positive: false },
  escrow_hold:    { icon: <Lock           size={16} />, positive: false },
  payment:        { icon: <CircleDollarSign size={16} />, positive: false },
  refund:         { icon: <RefreshCw      size={16} />, positive: true  },
};

function TransactionRow({ tx }: { tx: Transaction }) {
  const meta     = TX_META[tx.type] ?? TX_META.payment;
  const positive = meta.positive;
  return (
    <div className="tx-row">
      <div className="tx-icon" style={{ background: positive ? '#ecfdf5' : '#fef2f2', color: positive ? '#059669' : '#dc2626' }}>
        {meta.icon}
      </div>
      <div className="feed-body">
        <div className="feed-title">{tx.description || tx.type.replace(/_/g, ' ')}</div>
        <div className="feed-meta">
          {new Date(tx.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
          &nbsp;&middot;&nbsp;<span style={{ textTransform: 'capitalize', color: tx.status === 'completed' ? '#059669' : '#6b7280' }}>{tx.status}</span>
        </div>
      </div>
      <div className="feed-aside">
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: positive ? '#059669' : '#dc2626' }}>
          {positive ? '+' : '-'}{tx.currency}&nbsp;{tx.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Row
// ─────────────────────────────────────────────────────────────────────────────

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  bid_received:     <Briefcase   size={16} color="#6366f1" />,
  bid_accepted:     <CheckCircle2 size={16} color="#059669" />,
  job_completed:    <Award        size={16} color="#f59e0b" />,
  new_message:      <MessageCircle size={16} color="#db2777" />,
  payment_received: <CircleDollarSign size={16} color="#16a34a" />,
  system:           <Bell         size={16} color="#6b7280" />,
};

function NotificationRow({ notif, onRead }: { notif: AppNotification; onRead?: (id: string) => void }) {
  return (
    <div
      className={`notif-row${notif.isRead ? '' : ' notif-row--unread'}`}
      onClick={() => { if (!notif.isRead && onRead) onRead(notif.id); }}
      role={onRead ? 'button' : undefined}
      tabIndex={onRead ? 0 : undefined}
    >
      <div className="notif-icon">
        {NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.system}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="notif-title">{notif.title}</div>
        <div className="notif-body">{notif.body}</div>
        <div className="notif-time">
          {new Date(notif.createdAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {!notif.isRead && <div className="notif-dot" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ title, href, action }: { title: string; href?: string; action?: React.ReactNode }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link href={href} className="section-view-all">
          View All <ChevronRight size={14} />
        </Link>
      )}
      {action && !href && action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="dash-card" style={style}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-body">{body}</div>
      {cta && <div style={{ marginTop: 16 }}>{cta}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feed Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function FeedSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12, background: '#f9fafb' }}>
          <Sk w="52px" h="52px" r="10px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Sk w="65%" h="14px" />
            <Sk w="40%" h="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard CSS (injected once)
// ─────────────────────────────────────────────────────────────────────────────

const DASH_CSS = `
/* ── Animations ────────────────────────────────────────────────────────────── */
@keyframes sk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Stat Cards ─────────────────────────────────────────────────────────────── */
.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.2s, transform 0.2s;
  animation: scale-in 0.35s ease-out both;
  cursor: default;
}
.stat-card:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  transform: translateY(-3px);
}
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--accent-bg);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 4px;
}

/* ── Quick Actions ──────────────────────────────────────────────────────────── */
.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 10px;
  border-radius: 16px;
  background: var(--qa-bg);
  border: 1px solid color-mix(in srgb, var(--qa-color) 15%, transparent);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  min-width: 0;
}
.quick-action:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--qa-color) 25%, transparent);
}
.qa-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--qa-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.quick-action:hover .qa-icon { transform: scale(1.08); }
.qa-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #374151;
  text-align: center;
  line-height: 1.25;
}

/* ── Dashboard Cards ────────────────────────────────────────────────────────── */
.dash-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  animation: fade-up 0.4s ease-out both;
}

/* ── Feed Rows ──────────────────────────────────────────────────────────────── */
.feed-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #f3f4f6;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.feed-row:hover {
  background: #f5f3ff;
  border-color: #c4b5fd;
  box-shadow: 0 2px 12px rgba(79,70,229,0.08);
}
.feed-row--orange:hover {
  background: #fff7ed;
  border-color: #fed7aa;
  box-shadow: 0 2px 12px rgba(249,115,22,0.08);
}
.feed-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.feed-body { flex: 1; min-width: 0; }
.feed-title {
  font-weight: 700;
  font-size: 0.88rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.feed-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 3px;
  flex-wrap: wrap;
}
.feed-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
  padding: 1px 7px;
  border-radius: 20px;
}
.feed-aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
}
.feed-price {
  font-weight: 800;
  font-size: 0.95rem;
  color: #4f46e5;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
}

/* ── Transaction Row ────────────────────────────────────────────────────────── */
.tx-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}
.tx-row:last-child { border-bottom: none; }
.tx-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Notifications ──────────────────────────────────────────────────────────── */
.notif-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: default;
  transition: background 0.15s;
  border-radius: 8px;
}
.notif-row:last-child { border-bottom: none; }
.notif-row--unread { cursor: pointer; }
.notif-row--unread:hover { background: #f9fafb; }
.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notif-row--unread .notif-icon { background: #eff6ff; }
.notif-title {
  font-size: 0.83rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.35;
}
.notif-row--unread .notif-title { font-weight: 700; }
.notif-body {
  font-size: 0.77rem;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.4;
}
.notif-time {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 4px;
}
.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4f46e5;
  flex-shrink: 0;
  margin-top: 6px;
}

/* ── Section header ─────────────────────────────────────────────────────────── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.section-view-all {
  font-size: 0.78rem;
  font-weight: 600;
  color: #4f46e5;
  display: flex;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  transition: color 0.15s;
}
.section-view-all:hover { color: #3730a3; }

/* ── Empty State ────────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 36px 20px;
}
.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  margin: 0 auto 14px;
}
.empty-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: #374151;
  margin-bottom: 6px;
}
.empty-body { font-size: 0.82rem; color: #9ca3af; line-height: 1.5; }

/* ── Tab Navigation ─────────────────────────────────────────────────────────── */
.dash-tabs {
  display: flex;
  gap: 4px;
  background: #fff;
  padding: 5px;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  width: fit-content;
  margin-bottom: 20px;
  animation: fade-up 0.4s ease-out 0.1s both;
}
.dash-tab {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.83rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.18s;
  background: transparent;
  color: #6b7280;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.dash-tab:hover:not(.dash-tab--active) { background: #f5f3ff; color: #374151; }
.dash-tab--active {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  box-shadow: 0 3px 12px rgba(79,70,229,0.35);
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
.dash-hero {
  background: linear-gradient(140deg, #1e1b4b 0%, #3730a3 40%, #4f46e5 70%, #6366f1 100%);
  padding: 44px 0 76px;
  position: relative;
  overflow: hidden;
}
.hero-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  pointer-events: none;
}
.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}
.hero-avatar-wrap { position: relative; flex-shrink: 0; }
.hero-avatar {
  width: 90px;
  height: 90px;
  border-radius: 24px;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255,255,255,0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  overflow: hidden;
}
.hero-premium-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(245,158,11,0.5);
}
.hero-info { flex: 1; min-width: 0; }
.hero-name {
  font-size: 1.65rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px;
  line-height: 1.1;
  font-family: var(--font-family-title, inherit);
}
.hero-sub { color: rgba(255,255,255,0.65); font-size: 0.85rem; margin: 0 0 12px; }
.hero-badges { display: flex; gap: 7px; flex-wrap: wrap; }
.hero-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 11px;
  border-radius: 20px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hero-actions { display: flex; gap: 8px; flex-shrink: 0; align-self: flex-start; }
.hero-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  transition: background 0.15s, transform 0.15s;
  position: relative;
  cursor: pointer;
}
.hero-btn:hover { background: rgba(255,255,255,0.22); transform: translateY(-1px); }

/* ── Wallet card (sidebar) ──────────────────────────────────────────────────── */
.wallet-card {
  border-radius: 20px;
  background: linear-gradient(140deg, #1e1b4b 0%, #4f46e5 60%, #7c3aed 100%);
  padding: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.wallet-card-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  pointer-events: none;
}
.wallet-balance-label { font-size: 0.76rem; opacity: 0.65; margin: 0; }
.wallet-balance-value {
  font-size: 2rem;
  font-weight: 800;
  margin: 4px 0 0;
  line-height: 1;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}
.wallet-sub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 18px 0;
}
.wallet-sub-cell {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px 14px;
}
.wallet-sub-label { font-size: 0.68rem; opacity: 0.65; margin: 0 0 3px; }
.wallet-sub-value { font-weight: 700; font-size: 0.92rem; margin: 0; }
.wallet-actions { display: flex; gap: 8px; }
.wallet-btn {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.15s, transform 0.15s;
  font-family: inherit;
  cursor: pointer;
}
.wallet-btn:hover { background: rgba(255,255,255,0.22); transform: translateY(-1px); }

/* ── Premium CTA ────────────────────────────────────────────────────────────── */
.premium-card {
  border-radius: 20px;
  padding: 22px;
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
  border: 1px solid #fde68a;
  position: relative;
  overflow: hidden;
}
.premium-icon-bg {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0.12;
  pointer-events: none;
}
.premium-title {
  font-weight: 800;
  font-size: 0.98rem;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
}
.premium-desc { font-size: 0.81rem; color: #78350f; line-height: 1.55; margin: 0 0 14px; }
.premium-features { margin: 0 0 16px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.premium-feature {
  font-size: 0.77rem;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 7px;
}

/* ── Account links ──────────────────────────────────────────────────────────── */
.account-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #374151;
  transition: background 0.13s;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  font-family: inherit;
}
.account-link:hover { background: #f9fafb; }
.account-link--danger { color: #dc2626; }
.account-link--danger:hover { background: #fef2f2; }
.account-link-icon { flex-shrink: 0; }
.account-link-arrow { margin-left: auto; color: #9ca3af; }

/* ── Layout ─────────────────────────────────────────────────────────────────── */
.dash-body {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f7ff 0%, #f9fafb 100%);
  padding-bottom: 80px;
}
.dash-container {
  margin-top: -44px;
  position: relative;
  z-index: 2;
}
.dash-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  animation: fade-up 0.35s ease-out both;
}
.dash-actions-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}
.dash-two-col {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  align-items: start;
}
.dash-col { display: flex; flex-direction: column; gap: 18px; }

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .dash-two-col { grid-template-columns: 1fr 320px; }
  .dash-actions-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 900px) {
  .dash-two-col { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .dash-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-actions-grid { grid-template-columns: repeat(4, 1fr); }
  .dash-hero { padding: 32px 0 60px; }
  .dash-tabs { overflow-x: auto; max-width: 100%; }
  .hero-name { font-size: 1.3rem; }
  .stat-value { font-size: 1.5rem; }
}
@media (max-width: 400px) {
  .dash-actions-grid { grid-template-columns: repeat(4, 1fr); }
  .dash-tab { padding: 7px 12px; font-size: 0.77rem; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Content Component
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_DATA: DashboardData = {
  jobs: [], listings: [], wallet: null, transactions: [], notifications: [], unreadCount: 0,
  stats: { jobsPosted: 0, jobsDone: 0, listingsCount: 0, avgRating: null, reviewCount: 0, walletBalance: 0, walletCurrency: 'USD' },
};

function DashboardContent() {
  const { user, logout } = useAuth();
  const [data, setData]       = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<Tab>('overview');

  // ── Fetch all dashboard data via single backend call ─────────────────────
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: DashboardData }>('/profile/dashboard');
      if (res.success && res.data) {
        setData(res.data.data);
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // ── Mark notification as read ─────────────────────────────────────────────
  const handleMarkRead = useCallback(async (id: string) => {
    await api.put(`/notifications/${id}/read`, {});
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }, []);

  const { stats, wallet, jobs, listings, transactions, notifications, unreadCount } = data;

  return (
    <>
      {/* Inject scoped CSS */}
      <style dangerouslySetInnerHTML={{ __html: DASH_CSS }} />

      <div className="dash-body">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="dash-hero">
          <div className="hero-orb" style={{ width: 300, height: 300, top: -80, right: -60 }} />
          <div className="hero-orb" style={{ width: 160, height: 160, bottom: -60, left: '15%' }} />
          <div className="container hero-inner">

            {/* Avatar */}
            <div className="hero-avatar-wrap">
              <div className="hero-avatar">
                {user?.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={user.avatarUrl} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user?.displayName?.charAt(0)?.toUpperCase() ?? <User size={32} />)}
              </div>
              {user?.isPremium && (
                <div className="hero-premium-badge">
                  <Crown size={12} color="#fff" />
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="hero-info">
              <h1 className="hero-name">{user?.displayName || 'Welcome back'}</h1>
              <p className="hero-sub">{user?.email || user?.phone || 'Luvio Member'}</p>
              <div className="hero-badges">
                <span className="hero-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'capitalize' }}>
                  <Briefcase size={11} />{user?.role || 'customer'}
                </span>
                {user?.isVerified && (
                  <span className="hero-badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.3)' }}>
                    <BadgeCheck size={11} /> Verified
                  </span>
                )}
                {user?.isPremium && (
                  <span className="hero-badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', borderColor: 'rgba(245,158,11,0.3)' }}>
                    <Crown size={11} /> Premium
                  </span>
                )}
                {stats.avgRating && (
                  <span className="hero-badge" style={{ background: 'rgba(251,191,36,0.2)', color: '#fde68a', borderColor: 'rgba(251,191,36,0.3)' }}>
                    <Star size={11} />{stats.avgRating.toFixed(1)} ({stats.reviewCount})
                  </span>
                )}
              </div>
            </div>

            {/* Icon buttons */}
            <div className="hero-actions">
              <Link href="/notifications" id="dash-notif-btn" className="hero-btn" title="Notifications">
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', padding: '0 3px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/chat" id="dash-chat-btn" className="hero-btn" title="Messages">
                <MessageCircle size={17} />
              </Link>
              <Link href="/profile/settings" id="dash-settings-btn" className="hero-btn" title="Settings">
                <Settings size={17} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="container dash-container">

          {/* Error banner */}
          {error && !loading && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontSize: '0.85rem', fontWeight: 500 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
              <button onClick={loadDashboard} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="dash-stats-grid">
            <StatCard icon={<Briefcase   size={20} />} label="Jobs Posted"     value={loading ? 0 : stats.jobsPosted}    color="#4f46e5" bg="#eef2ff"  loading={loading} />
            <StatCard icon={<CheckCircle2 size={20} />} label="Completed"       value={loading ? 0 : stats.jobsDone}      color="#059669" bg="#ecfdf5"  loading={loading} />
            <StatCard icon={<ShoppingBag  size={20} />} label="Listings"        value={loading ? 0 : stats.listingsCount} color="#f97316" bg="#fff7ed"  loading={loading} />
            <StatCard icon={<Star         size={20} />} label="Avg Rating"      value={loading ? 0 : (stats.avgRating ?? 0)} suffix={stats.avgRating ? '' : ' —'} decimals={stats.avgRating ? 1 : 0} color="#f59e0b" bg="#fffbeb" loading={loading} />
            <StatCard icon={<WalletIcon   size={20} />} label="Wallet Balance"  value={loading ? 0 : stats.walletBalance} prefix={stats.walletCurrency + ' '} decimals={2} color="#8b5cf6" bg="#f5f3ff" loading={loading} />
          </div>

          {/* Quick Actions */}
          <div className="dash-card" style={{ marginBottom: 18, animationDelay: '0.06s' }}>
            <SectionHeader title="Quick Actions" />
            <div className="dash-actions-grid">
              <QuickAction icon={<Plus          size={20} />} label="Post Job"    href="/jobs/create"       color="#4f46e5" bg="#eef2ff" />
              <QuickAction icon={<Package       size={20} />} label="New Listing" href="/marketplace/create" color="#f97316" bg="#fff7ed" />
              <QuickAction icon={<Eye           size={20} />} label="Browse Jobs" href="/jobs"               color="#059669" bg="#ecfdf5" />
              <QuickAction icon={<ShoppingBag   size={20} />} label="Marketplace" href="/marketplace"        color="#0891b2" bg="#ecfeff" />
              <QuickAction icon={<MapPin        size={20} />} label="Explore Map" href="/maps"               color="#7c3aed" bg="#f5f3ff" />
              <QuickAction icon={<MessageCircle size={20} />} label="Messages"   href="/chat"               color="#db2777" bg="#fdf2f8" />
              <QuickAction icon={<WalletIcon    size={20} />} label="Wallet"     href="/wallet"             color="#16a34a" bg="#f0fdf4" />
              <QuickAction icon={<Crown         size={20} />} label="Premium"    href="/premium"            color="#d97706" bg="#fffbeb" />
            </div>
          </div>

          {/* Tabs */}
          <div className="dash-tabs">
            {([
              { key: 'overview', label: 'Overview',    icon: <BarChart3     size={14} /> },
              { key: 'jobs',     label: 'Jobs',        icon: <Briefcase     size={14} /> },
              { key: 'market',   label: 'Market',      icon: <ShoppingBag   size={14} /> },
              { key: 'wallet',   label: 'Wallet',      icon: <WalletIcon    size={14} /> },
            ] as const).map(({ key, label, icon }) => (
              <button
                key={key}
                className={`dash-tab${tab === key ? ' dash-tab--active' : ''}`}
                onClick={() => setTab(key)}
                id={`dash-tab-${key}`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="dash-two-col">

            {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
            <div className="dash-col">

              {/* My Jobs */}
              {(tab === 'overview' || tab === 'jobs') && (
                <Card>
                  <SectionHeader title="My Jobs" href="/jobs" />
                  {loading ? <FeedSkeleton /> :
                   jobs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {jobs.map(j => <JobRow key={j.id} job={j} />)}
                    </div>
                   ) : (
                    <EmptyState
                      icon={<Briefcase size={26} />}
                      title="No jobs yet"
                      body="Post your first job to start receiving bids from skilled workers."
                      cta={<Link href="/jobs/create" id="dash-post-job-btn" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={15} /> Post a Job</Link>}
                    />
                   )}
                </Card>
              )}

              {/* My Listings */}
              {(tab === 'overview' || tab === 'market') && (
                <Card>
                  <SectionHeader title="My Listings" href="/marketplace" />
                  {loading ? <FeedSkeleton /> :
                   listings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {listings.map(l => <ListingRow key={l.id} listing={l} />)}
                    </div>
                   ) : (
                    <EmptyState
                      icon={<ShoppingBag size={26} />}
                      title="No listings yet"
                      body="Create a listing to sell items or give them away to your community."
                      cta={<Link href="/marketplace/create" id="dash-create-listing-btn" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={15} /> Create Listing</Link>}
                    />
                   )}
                </Card>
              )}

              {/* Recent Transactions */}
              {tab === 'wallet' && (
                <Card>
                  <SectionHeader title="Recent Transactions" href="/wallet" />
                  {loading ? <FeedSkeleton rows={4} /> :
                   transactions.length > 0 ? (
                    <div>{transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)}</div>
                   ) : (
                    <EmptyState
                      icon={<CircleDollarSign size={26} />}
                      title="No transactions yet"
                      body="Deposit funds to your wallet to start paying for jobs and purchases."
                    />
                   )}
                </Card>
              )}
            </div>

            {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
            <div className="dash-col">

              {/* Wallet Card */}
              <div className="wallet-card">
                <div className="wallet-card-orb" style={{ width: 130, height: 130, top: -30, right: -20 }} />
                <div className="wallet-card-orb" style={{ width: 80,  height: 80,  bottom: -25, left: -10 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <p className="wallet-balance-label">Available Balance</p>
                      <p className="wallet-balance-value">
                        {loading ? '—' : `${stats.walletCurrency} ${stats.walletBalance.toFixed(2)}`}
                      </p>
                    </div>
                    <WalletIcon size={22} style={{ opacity: 0.5 }} />
                  </div>
                  <div className="wallet-sub-grid">
                    <div className="wallet-sub-cell">
                      <p className="wallet-sub-label">Total Earned</p>
                      <p className="wallet-sub-value">{loading ? '—' : `${wallet?.currency ?? 'USD'} ${(wallet?.totalEarnings ?? 0).toFixed(2)}`}</p>
                    </div>
                    <div className="wallet-sub-cell">
                      <p className="wallet-sub-label">Withdrawn</p>
                      <p className="wallet-sub-value">{loading ? '—' : `${wallet?.currency ?? 'USD'} ${(wallet?.totalWithdrawn ?? 0).toFixed(2)}`}</p>
                    </div>
                  </div>
                  <div className="wallet-actions">
                    <Link href="/wallet" id="dash-deposit-btn" className="wallet-btn"><ArrowDownLeft size={14} /> Deposit</Link>
                    <Link href="/wallet" id="dash-withdraw-btn" className="wallet-btn"><ArrowUpRight size={14} /> Withdraw</Link>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <Card>
                <SectionHeader
                  title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  href="/notifications"
                />
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <Sk w="36px" h="36px" r="10px" />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                          <Sk w="70%" h="12px" />
                          <Sk w="50%" h="10px" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div>
                    {notifications.map(n => <NotificationRow key={n.id} notif={n} onRead={handleMarkRead} />)}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Bell size={24} />}
                    title="All caught up!"
                    body="No new notifications. We'll let you know when something happens."
                  />
                )}
              </Card>

              {/* Premium CTA */}
              {!user?.isPremium && (
                <div className="premium-card">
                  <div className="premium-icon-bg"><Crown size={90} color="#d97706" /></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p className="premium-title"><Crown size={18} color="#d97706" />Unlock Premium</p>
                    <p className="premium-desc">
                      Get featured placements, verified badge, advanced analytics, and elevated platform limits.
                    </p>
                    <ul className="premium-features">
                      {[
                        'Priority placement in search results',
                        'Featured job & listing badges',
                        'Advanced analytics dashboard',
                        'Verified premium profile badge',
                      ].map(f => (
                        <li key={f} className="premium-feature">
                          <CheckCircle2 size={13} color="#d97706" style={{ flexShrink: 0 }} />{f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/premium" id="dash-premium-btn" className="btn" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none' }}>
                      <Zap size={15} /> Upgrade to Premium
                    </Link>
                  </div>
                </div>
              )}

              {/* Account */}
              <Card>
                <SectionHeader title="Account" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { icon: <Award size={16} color="#4f46e5" />,   label: 'My Reviews',  href: '/profile/reviews',   id: 'dash-reviews-link' },
                    { icon: <TrendingUp size={16} color="#059669" />, label: 'Analytics', href: '/profile/analytics', id: 'dash-analytics-link' },
                    { icon: <Shield size={16} color="#0891b2" />,   label: 'Privacy',    href: '/profile/privacy',   id: 'dash-privacy-link' },
                    { icon: <Settings size={16} color="#6b7280" />, label: 'Settings',   href: '/profile/settings',  id: 'dash-settings-link' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} id={item.id} className="account-link">
                      <span className="account-link-icon">{item.icon}</span>
                      {item.label}
                      <ChevronRight size={14} className="account-link-arrow" />
                    </Link>
                  ))}
                  <button id="dash-logout-btn" onClick={logout} className="account-link account-link--danger">
                    <LogOut size={16} style={{ flexShrink: 0 }} />
                    Sign Out
                  </button>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <Header />
      <RequireAuth>
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <DashboardContent />
        </main>
      </RequireAuth>
      <MobileNav />
    </div>
  );
}

'use client';

/**
 * Luvio Platform — Jobs Page
 * Parallel-loaded jobs feed with skeleton loading, image support, and filters.
 * Uses useJobs() hook which fires the API request immediately on mount.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';
import { useJobs, type Job } from '@/lib/hooks';

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: '180px', background: 'linear-gradient(90deg, #f0f0f5 25%, #e8e8f0 50%, #f0f0f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ height: '20px', background: '#f0f0f5', borderRadius: '8px', marginBottom: '10px', width: '70%' }} />
        <div style={{ height: '14px', background: '#f0f0f5', borderRadius: '8px', marginBottom: '6px', width: '90%' }} />
        <div style={{ height: '14px', background: '#f0f0f5', borderRadius: '8px', marginBottom: '16px', width: '60%' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ height: '32px', background: '#f0f0f5', borderRadius: '8px', flex: 1 }} />
          <div style={{ height: '32px', background: '#f0f0f5', borderRadius: '8px', width: '80px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ────────────────────────────────────────────────────────────────

const PAYMENT_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  escrow: { label: '🔒 Escrow', color: '#6366f1', bg: '#eef2ff' },
  cash: { label: '💵 Cash', color: '#16a34a', bg: '#f0fdf4' },
  wallet: { label: '👛 Wallet', color: '#d97706', bg: '#fffbeb' },
};

function JobCard({ job }: { job: Job }) {
  const badge = PAYMENT_BADGE[job.paymentMode] ?? PAYMENT_BADGE.cash;
  const hasImage = job.images && job.images.length > 0;

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(84,101,255,0.14)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Image */}
        <div style={{ height: '180px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.images[0]}
              alt={job.title}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem', opacity: 0.4 }}>
              💼
            </div>
          )}
          {/* Image count badge */}
          {job.images.length > 1 && (
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              +{job.images.length - 1} photos
            </div>
          )}
          {/* Category chip */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--color-primary-600)', backdropFilter: 'blur(6px)' }}>
            {job.category}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {job.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {job.description}
          </p>

          {job.locationName && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              📍 {job.locationName}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
              {job.currency} {job.budget.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: badge.color, background: badge.bg, borderRadius: '6px', padding: '3px 8px' }}>
              {badge.label}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', '🧹 Cleaning', '🔧 Repair', '📦 Moving', '🌿 Gardening', '📚 Tutoring', '🐾 Pet Care', '💻 Tech'];
const CAT_MAP: Record<string, string> = {
  '🧹 Cleaning': 'cleaning', '🔧 Repair': 'repair', '📦 Moving': 'moving',
  '🌿 Gardening': 'gardening', '📚 Tutoring': 'tutoring', '🐾 Pet Care': 'pet-care', '💻 Tech': 'tech',
};

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const category = activeCategory === 'All' ? undefined : CAT_MAP[activeCategory];

  // Parallel API request fires immediately on mount / category change
  const { data, loading, error, refetch } = useJobs({ category });
  const jobs = data?.data ?? [];

  return (
    <AuthProvider>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  Jobs &amp; Services
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  {loading ? 'Loading jobs…' : `${data?.meta.total ?? 0} jobs available`}
                </p>
              </div>
              <Link href="/jobs/create" className="btn btn-primary" id="jobs-create-btn">
                + Post a Job
              </Link>
            </div>

            {/* Category chips */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn ${cat === activeCategory ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)', transition: 'all 0.15s' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Error state */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>Failed to load jobs</p>
                  <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
                </div>
                <button onClick={refetch} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Retry</button>
              </div>
            )}

            {/* Skeleton grid — shows while loading */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            )}

            {/* Jobs grid — all cards loaded in parallel */}
            {!loading && jobs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {jobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && jobs.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>💼</div>
                <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>No Jobs Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                  {activeCategory !== 'All' ? `No jobs in the "${activeCategory}" category yet.` : 'Be the first to post a job in your area!'}
                </p>
                <Link href="/jobs/create" className="btn btn-primary">Post a Job</Link>
              </div>
            )}

            {/* Pagination */}
            {!loading && data && data.meta.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', alignSelf: 'center' }}>
                  Page {data.meta.page} of {data.meta.pages} · {data.meta.total} total
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

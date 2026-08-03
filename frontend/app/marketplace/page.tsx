'use client';

/**
 * Luvio Platform — Marketplace Page
 * Parallel-loaded listings feed with skeleton loading, image carousel support, and category filters.
 * Uses useListings() hook which fires the API request immediately on mount.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer, RequireAuth } from '@/components/layout';
import { useListings, type Listing } from '@/lib/hooks';

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function ListingCardSkeleton() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: '200px', background: 'linear-gradient(90deg, #f0f0f5 25%, #e8e8f0 50%, #f0f0f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '14px' }}>
        <div style={{ height: '18px', background: '#f0f0f5', borderRadius: '8px', marginBottom: '8px', width: '75%' }} />
        <div style={{ height: '13px', background: '#f0f0f5', borderRadius: '8px', marginBottom: '12px', width: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ height: '22px', background: '#f0f0f5', borderRadius: '8px', width: '80px' }} />
          <div style={{ height: '22px', background: '#f0f0f5', borderRadius: '8px', width: '60px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Listing Card ────────────────────────────────────────────────────────────

const CONDITION_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  new:      { label: 'New',       color: '#16a34a', bg: '#f0fdf4' },
  like_new: { label: 'Like New',  color: '#2563eb', bg: '#eff6ff' },
  good:     { label: 'Good',      color: '#7c3aed', bg: '#f5f3ff' },
  fair:     { label: 'Fair',      color: '#d97706', bg: '#fffbeb' },
  poor:     { label: 'Poor',      color: '#dc2626', bg: '#fef2f2' },
};

function ListingCard({ listing }: { listing: Listing }) {
  const [imgIdx, setImgIdx] = useState(0);
  const cond = CONDITION_STYLE[listing.condition] ?? CONDITION_STYLE.good;
  const hasImages = listing.images && listing.images.length > 0;

  return (
    <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        style={{
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
        {/* Image area */}
        <div style={{ height: '200px', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {hasImages ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.images[imgIdx]}
                alt={listing.title}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
              />
              {/* Image dot nav for multiple images */}
              {listing.images.length > 1 && (
                <div
                  style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}
                  onClick={(e) => e.preventDefault()}
                >
                  {listing.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                      style={{
                        width: i === imgIdx ? '16px' : '6px',
                        height: '6px',
                        borderRadius: '3px',
                        background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem', opacity: 0.4 }}>
              🛍️
            </div>
          )}

          {/* Type badge */}
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: listing.type === 'giveaway' ? 'rgba(22, 163, 74, 0.9)' : 'rgba(255,255,255,0.9)',
            color: listing.type === 'giveaway' ? '#fff' : 'var(--color-primary-600)',
            borderRadius: '20px', padding: '3px 10px',
            fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(6px)',
          }}>
            {listing.type === 'giveaway' ? '🎁 Free' : listing.category}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {listing.title}
          </h3>

          {listing.locationName && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              📍 {listing.locationName}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            {listing.type === 'giveaway' ? (
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>FREE</span>
            ) : (
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                {listing.currency} {listing.price?.toLocaleString()}
              </span>
            )}
            <span style={{ fontSize: '11px', fontWeight: 600, color: cond.color, background: cond.bg, borderRadius: '6px', padding: '3px 8px' }}>
              {cond.label}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', '📱 Electronics', '🛋️ Furniture', '👗 Clothing', '🚗 Vehicles', '🏡 Home', '⚽ Sports', '📖 Books', '🧸 Other'];
const CAT_MAP: Record<string, string> = {
  '📱 Electronics': 'electronics', '🛋️ Furniture': 'furniture', '👗 Clothing': 'clothing',
  '🚗 Vehicles': 'vehicles', '🏡 Home': 'home', '⚽ Sports': 'sports',
  '📖 Books': 'books', '🧸 Other': 'other',
};
const TYPES = ['All', 'For Sale', 'Free / Giveaway'];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('All');

  const category = activeCategory === 'All' ? undefined : CAT_MAP[activeCategory];
  const type = activeType === 'For Sale' ? 'sell' : activeType === 'Free / Giveaway' ? 'giveaway' : undefined;

  // Fires immediately on mount & on filter change — parallel where possible
  const { data, loading, error, refetch } = useListings({ category, type });
  const listings = data?.data ?? [];

  return (
    <>
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
        <RequireAuth>
          <main className="main-content">
            <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  Community Market
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  {loading ? 'Loading listings…' : `${data?.meta?.total ?? 0} listings available`}
                </p>
              </div>
              <Link href="/marketplace/create" className="btn btn-primary" id="marketplace-create-btn">
                + List Item
              </Link>
            </div>

            {/* Type filter row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`btn ${t === activeType ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  {t}
                </button>
              ))}
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
                  <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>Failed to load listings</p>
                  <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
                </div>
                <button onClick={refetch} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Retry</button>
              </div>
            )}

            {/* Skeleton grid — 10 placeholders loading in parallel */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 10 }).map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            )}

            {/* Listings grid — all images lazy-loaded in parallel by the browser */}
            {!loading && listings.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && listings.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🛍️</div>
                <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>No Listings Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                  {activeCategory !== 'All' ? `No listings in "${activeCategory}" yet.` : 'Start selling or giving away items to your neighbors!'}
                </p>
                <Link href="/marketplace/create" className="btn btn-primary">List an Item</Link>
              </div>
            )}

            {/* Pagination info */}
            {!loading && data && data.meta?.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Page {data.meta?.page} of {data.meta?.pages} · {data.meta?.total} total
                </p>
              </div>
            )}
          </div>
        </main>
        </RequireAuth>

        <MobileNav />
      </div>
    </>
  );
}

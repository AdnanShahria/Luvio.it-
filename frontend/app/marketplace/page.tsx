'use client';

import React from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function MarketplacePage() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  Community Market
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Buy, sell, or give away items in your neighborhood
                </p>
              </div>
              <Link href="/marketplace/create" className="btn btn-primary" id="marketplace-create-btn">
                + List Item
              </Link>
            </div>

            {/* Category Chips */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              {['All', '📱 Electronics', '🛋️ Furniture', '👗 Clothing', '🚗 Vehicles', '🏡 Home', '⚽ Sports', '📖 Books', '🧸 Kids'].map(cat => (
                <button
                  key={cat}
                  className={`btn ${cat === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Empty State */}
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🛍️</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>No Listings Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                Start selling or giving away items to your neighbors!
              </p>
              <Link href="/marketplace/create" className="btn btn-primary">List an Item</Link>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

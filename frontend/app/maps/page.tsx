'use client';

import React from 'react';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function MapsPage() {
  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <Header />
      <main className="main-content">
        <div style={{ height: 'calc(100dvh - var(--header-height))', position: 'relative' }}>
          {/* Map placeholder */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}>
            <div style={{ fontSize: '5rem' }}>🗺️</div>
            <h2 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Interactive Map</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '20rem' }}>
              Discover nearby jobs and marketplace listings on an interactive map. Coming in Phase 2.
            </p>
          </div>

          {/* Search overlay */}
          <div style={{
            position: 'absolute',
            top: 'var(--space-4)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '30rem',
          }}>
            <input
              type="search"
              className="input glass"
              placeholder="Search location..."
              style={{ boxShadow: 'var(--shadow-lg)' }}
              id="maps-search-input"
            />
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

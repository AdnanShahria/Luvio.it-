'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Header, MobileNav, Footer, RequireAuth } from '@/components/layout';

function ProfileContent() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
      {/* Profile Header */}
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)', marginBottom: 'var(--space-6)' }}>
        <div className="avatar avatar-xl" style={{ margin: '0 auto var(--space-4)', fontSize: 'var(--font-size-3xl)' }}>
          {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          {user?.displayName || 'Guest User'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
          {user?.email || user?.phone || 'Not signed in'}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-3)' }}>
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
            {user?.role || 'customer'}
          </span>
          {user?.isVerified && <span className="badge badge-success">✓ Verified</span>}
          {user?.isPremium && <span className="badge badge-premium">⭐ Premium</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Jobs Posted', value: '0', icon: '💼' },
          { label: 'Jobs Done', value: '0', icon: '✅' },
          { label: 'Listings', value: '0', icon: '🛍️' },
          { label: 'Rating', value: '—', icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '1.5rem' }}>{stat.icon}</div>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', margin: 'var(--space-1) 0' }}>{stat.value}</p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <Header />
      <RequireAuth>
        <main className="main-content">
          <ProfileContent />
        </main>
      </RequireAuth>

      <MobileNav />
    </div>
  );
}

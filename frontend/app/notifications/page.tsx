'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function NotificationsPage() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '40rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                Notifications
              </h1>
              <button className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }} id="notifications-mark-all-btn">
                Mark all read
              </button>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔔</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>All Caught Up!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No new notifications</p>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

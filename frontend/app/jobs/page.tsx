'use client';

import React from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function JobsPage() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  Jobs & Services
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Find local jobs or hire trusted workers in your neighborhood
                </p>
              </div>
              <Link href="/jobs/create" className="btn btn-primary" id="jobs-create-btn">
                + Post a Job
              </Link>
            </div>

            {/* Category Chips */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              {['All', '🧹 Cleaning', '🔧 Repair', '📦 Moving', '🌿 Gardening', '📚 Tutoring', '🐾 Pet Care', '💻 Tech'].map(cat => (
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
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>💼</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>No Jobs Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                Be the first to post a job in your area!
              </p>
              <Link href="/jobs/create" className="btn btn-primary">Post a Job</Link>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

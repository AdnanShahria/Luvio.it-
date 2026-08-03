'use client';

/**
 * Luvio Platform — Privacy Policy Page
 */

import React from 'react';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function PrivacyPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="container" style={{ padding: 'var(--space-12) var(--space-4)', maxWidth: '48rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 'var(--space-6)' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '0.95rem' }}>
            Last updated: August 2026
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', color: 'var(--text-primary)', lineHeight: 1.7 }}>
            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>1. Information We Collect</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We collect information you provide directly to us when creating an account, posting listings, or communicating with neighbors. This includes contact details, profile data, location preferences, and transaction details.
              </p>
            </section>

            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>2. How We Use Information</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your information is used to provide and personalize Luvio services, facilitate trusted neighborhood connections, process payments, and ensure platform safety and security.
              </p>
            </section>

            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>3. Location Data & Sharing</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your exact address is never publicly exposed without your permission. Geo-location services only display approximate neighborhood distance to protect user privacy.
              </p>
            </section>

            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>4. Security & Control</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We implement industry-standard encryption to safeguard your data. You may request account deletion or export your data at any time through your profile settings.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

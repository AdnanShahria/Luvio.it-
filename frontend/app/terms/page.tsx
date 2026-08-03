'use client';

/**
 * Luvio Platform — Terms of Service Page
 */

import React from 'react';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function TermsPage() {
  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <Header />
      <main className="main-content">
        <div className="container" style={{ padding: 'var(--space-12) var(--space-4)', maxWidth: '48rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 'var(--space-6)' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '0.95rem' }}>
            Last updated: August 2026
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', color: 'var(--text-primary)', lineHeight: 1.7 }}>
            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>1. Acceptance of Terms</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                By accessing or using the Luvio platform, mobile applications, or services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>2. User Account Responsibilities</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and truthful information.
              </p>
            </section>

            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>3. Community Guidelines & Safety</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Luvio is a neighborhood platform built on trust and mutual respect. Fraudulent activity, harassment, hate speech, or posting illegal content/items is strictly prohibited and will result in immediate termination of your account.
              </p>
            </section>

            <section className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>4. Payments & Escrow</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                All transaction processing and escrow services are handled securely through Luvio Escrow. Funds are released upon mutual confirmation of job completion or item delivery.
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

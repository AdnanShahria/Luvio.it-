'use client';

/**
 * Luvio Platform — Landing Page
 * Premium hero layout: pill navbar, two-column hero (text + banner), service pills.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

/* ─── Service data (All 6 features to rotate) ─── */
const ALL_SERVICES = [
  { icon: '💼', label: 'Jobs & Services', desc: 'Find local work or hire trusted professionals near you.' },
  { icon: '🛍️', label: 'Community Market', desc: 'Buy, sell, or give away items with your neighbors.' },
  { icon: '📍', label: 'Location Discovery', desc: 'Geo-fenced listings & interactive maps.' },
  { icon: '💬', label: 'Real-time Chat', desc: 'Context-aware messaging tied to jobs and listings.' },
  { icon: '💰', label: 'Secure Payments', desc: 'Escrow, digital wallet, multi-currency & mobile money.' },
  { icon: '⭐', label: 'Go Premium', desc: 'Priority placements, featured badges & elevated limits.' },
];

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />

        <main style={{ background: '#f8f9ff' }}>

          {/* ════════════════════════════════════════
              HERO SECTION
              ════════════════════════════════════════ */}
          <section className="hero-section">
            {/* Ambient background blobs */}
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />

            <div className="hero-inner container">

              {/* ── LEFT: Text + Services ── */}
              <div className="hero-left animate-fade-in-up">

                {/* Eyebrow badge */}
                <span className="hero-badge">
                  <span className="hero-badge-dot" />
                  Now in 13 languages
                </span>

                {/* Headline */}
                <h1 className="hero-headline">
                  Your Neighborhood{' '}
                  <span className="hero-headline-accent">Marketplace</span>
                  <br />& Community Hub
                </h1>

                {/* Description */}
                <p className="hero-desc">
                  Find local jobs, hire trusted workers, buy &amp; sell in your community, and chat
                  with neighbors — all in one premium platform.
                </p>

                {/* CTA row */}
                <div className="hero-cta-row">
                  <Link href="/auth/register" className="btn btn-primary btn-lg" id="hero-get-started-btn">
                    Get Started — Free
                  </Link>
                  <Link href="/jobs" className="btn btn-secondary btn-lg" id="hero-browse-jobs-btn">
                    Browse Jobs
                  </Link>
                </div>

                {/* ── Service Pills (Infinite Marquee) ── */}
                <div className="hero-services-wrapper">
                  <div className="hero-services-ticker">
                    {/* Render the array twice to create a seamless infinite loop */}
                    {[...ALL_SERVICES, ...ALL_SERVICES].map((s, idx) => (
                      <div key={idx} className="hero-service-card">
                        <div className="hero-service-header">
                          <span className="hero-service-icon">{s.icon}</span>
                          <div className="hero-service-title">{s.label}</div>
                        </div>
                        <div className="hero-service-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Hero Visual Banner ── */}
              <div className="hero-right animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="hero-banner-card">
                  {/* Decorative glow behind card */}
                  <div className="hero-banner-glow" />

                  {/* Mock UI inside banner */}
                  <div className="hero-banner-inner">
                    {/* Top bar mockup */}
                    <div className="mock-topbar">
                      <span className="mock-dot" style={{ background: '#ff5f56' }} />
                      <span className="mock-dot" style={{ background: '#ffbd2e' }} />
                      <span className="mock-dot" style={{ background: '#27c93f' }} />
                      <div className="mock-url-bar">luvio.it/jobs</div>
                    </div>

                    {/* Map visual placeholder */}
                    <div className="mock-map">
                      <div className="mock-map-bg" />
                      {/* Floating listing pins */}
                      {[
                        { top: '22%', left: '30%', label: 'Cleaner · €18/h', color: '#5465ff' },
                        { top: '48%', left: '58%', label: 'Dev · €55/h', color: '#3b42e6' },
                        { top: '68%', left: '20%', label: 'Delivery · €14/h', color: '#2c2db8' },
                      ].map((pin) => (
                        <div
                          key={pin.label}
                          className="mock-pin"
                          style={{ top: pin.top, left: pin.left, borderColor: pin.color }}
                        >
                          <span className="mock-pin-dot" style={{ background: pin.color }} />
                          <span className="mock-pin-label">{pin.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom stats row */}
                    <div className="mock-stats-row">
                      {[
                        { value: '12k+', label: 'Active Jobs' },
                        { value: '98%', label: 'Satisfaction' },
                        { value: '210', label: 'Countries' },
                      ].map((stat) => (
                        <div key={stat.label} className="mock-stat">
                          <span className="mock-stat-value">{stat.value}</span>
                          <span className="mock-stat-label">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating avatar cluster */}
                  <div className="mock-avatars">
                    {['#5465ff', '#3b42e6', '#2c2db8', '#768bff'].map((c, i) => (
                      <span key={i} className="mock-avatar" style={{ background: c, marginLeft: i === 0 ? 0 : '-10px', zIndex: 4 - i }}>
                        {['A', 'B', 'C', '+'][i]}
                      </span>
                    ))}
                    <span className="mock-avatar-label">1,200+ online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust bar */}
            <div className="hero-trust container animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {['🌍 210+ Countries', '💬 Real-time Chat', '🔒 Secure Escrow', '📱 Web + Mobile'].map((item, i, arr) => (
                <React.Fragment key={item}>
                  <span className="hero-trust-item">{item}</span>
                  {i < arr.length - 1 && <span className="hero-trust-dot" />}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════
              FEATURES SECTION
              ════════════════════════════════════════ */}
          <section style={{ padding: 'var(--space-16) var(--space-4)', background: '#fff' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
                  Everything Your Neighborhood Needs
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto' }}>
                  One platform for jobs, marketplace, and community.
                </p>
              </div>

              <div className="grid grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {ALL_SERVICES.map((f) => (
                  <div key={f.label} className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>{f.icon}</div>
                    <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                      {f.label}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              CTA SECTION
              ════════════════════════════════════════ */}
          <section style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center', background: '#f8f9ff' }}>
            <div className="container">
              <div className="gradient-primary" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-16) var(--space-8)', color: 'white' }}>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
                  Ready to Join Your Community?
                </h2>
                <p style={{ opacity: 0.9, maxWidth: '28rem', margin: '0 auto var(--space-8)', lineHeight: 'var(--line-height-relaxed)' }}>
                  Sign up for free and start connecting with your neighborhood today.
                </p>
                <Link href="/auth/register" className="btn btn-lg" id="cta-register-btn"
                  style={{ background: 'white', color: 'var(--color-primary-600)', fontWeight: 'var(--font-weight-bold)' }}>
                  Create Free Account
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

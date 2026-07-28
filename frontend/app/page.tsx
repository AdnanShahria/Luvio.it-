'use client';

/**
 * Luvio Platform — Landing Page
 * Premium hero section with gradient, feature cards, and CTAs.
 */

import React from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />

        <main className="main-content">
          {/* Hero Section */}
          <section style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 'var(--space-24) var(--space-4) var(--space-16)',
            textAlign: 'center',
          }}>
            {/* Background gradient */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(105, 56, 239, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Floating orbs */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(105, 56, 239, 0.06), transparent)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }} className="animate-float" />
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '10%',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 198, 146, 0.06), transparent)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              animationDelay: '1.5s',
            }} className="animate-float" />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              {/* Badge */}
              <div className="animate-fade-in-down" style={{ marginBottom: 'var(--space-6)' }}>
                <span className="badge badge-primary" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                  ✨ Now in 13 languages
                </span>
              </div>

              {/* Heading */}
              <h1
                className="animate-fade-in-up"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  lineHeight: 'var(--line-height-tight)',
                  letterSpacing: '-0.03em',
                  maxWidth: '48rem',
                  margin: '0 auto var(--space-6)',
                }}
              >
                Your Neighborhood{' '}
                <span className="gradient-text">Marketplace</span>{' '}
                & Community
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-in-up"
                style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--text-secondary)',
                  maxWidth: '36rem',
                  margin: '0 auto var(--space-8)',
                  lineHeight: 'var(--line-height-relaxed)',
                  animationDelay: '0.1s',
                }}
              >
                Find local jobs, hire trusted workers, buy & sell in your community, and chat with neighbors — all in one platform.
              </p>

              {/* CTA Buttons */}
              <div
                className="animate-fade-in-up"
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  animationDelay: '0.2s',
                }}
              >
                <Link href="/auth/register" className="btn btn-primary btn-lg" id="hero-get-started-btn">
                  Get Started — It&apos;s Free
                </Link>
                <Link href="/jobs" className="btn btn-secondary btn-lg" id="hero-browse-jobs-btn">
                  Browse Jobs
                </Link>
              </div>

              {/* Social proof */}
              <div
                className="animate-fade-in"
                style={{
                  marginTop: 'var(--space-12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-6)',
                  flexWrap: 'wrap',
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--font-size-sm)',
                  animationDelay: '0.4s',
                }}
              >
                <span>🌍 210+ Countries</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                <span>💬 Real-time Chat</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                <span>🔒 Secure Escrow</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                <span>📱 Web + Mobile</span>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section style={{ padding: 'var(--space-16) var(--space-4)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                <h2 style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--space-4)',
                }}>
                  Everything Your Neighborhood Needs
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto' }}>
                  One platform for jobs, marketplace, and community — designed to bring neighbors together.
                </p>
              </div>

              <div className="grid grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {/* Feature Card: Jobs */}
                <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💼</div>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                    Jobs & Services
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Post jobs, receive bids from verified workers, hire, and pay securely — all with real-time chat support.
                  </p>
                </div>

                {/* Feature Card: Marketplace */}
                <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🛍️</div>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                    Community Market
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Buy, sell, or give away items in your neighborhood. 9 categories, up to 5 photos, and direct chat with sellers.
                  </p>
                </div>

                {/* Feature Card: Maps */}
                <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📍</div>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                    Location Discovery
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Interactive maps with geo-fenced feeds. Find nearby jobs and listings with distance-based filtering.
                  </p>
                </div>

                {/* Feature Card: Chat */}
                <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💬</div>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                    Real-time Chat
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Context-aware messaging tied to jobs and listings. Instant delivery with push notification fallbacks.
                  </p>
                </div>

                {/* Feature Card: Wallet */}
                <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💰</div>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                    Secure Payments
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Escrow protection, digital wallet, multi-currency support, cards, bank transfers, and mobile money.
                  </p>
                </div>

                {/* Feature Card: Premium */}
                <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⭐</div>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
                    Go Premium
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Premium badges, featured listings, priority search placement, and elevated limits for power users.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section style={{
            padding: 'var(--space-16) var(--space-4)',
            textAlign: 'center',
          }}>
            <div className="container">
              <div
                className="gradient-primary"
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--space-16) var(--space-8)',
                  color: 'white',
                }}
              >
                <h2 style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--space-4)',
                }}>
                  Ready to Join Your Community?
                </h2>
                <p style={{
                  opacity: 0.9,
                  maxWidth: '28rem',
                  margin: '0 auto var(--space-8)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}>
                  Sign up for free and start connecting with your neighborhood today. Available on Web, iOS, and Android.
                </p>
                <Link
                  href="/auth/register"
                  className="btn btn-lg"
                  id="cta-register-btn"
                  style={{
                    background: 'white',
                    color: 'var(--color-primary-600)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
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

'use client';

/**
 * Luvio Platform — Landing Page
 * Premium hero layout: pill navbar, two-column hero (text + banner), service pills.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';
import { Briefcase, ShoppingBag, MapPin, MessageCircle, CircleDollarSign, Star, PenLine, Handshake, CheckCircle, Globe, Lock, Smartphone } from 'lucide-react';

/* ─── Service data (All 6 features to rotate) ─── */
const ALL_SERVICES = [
  { icon: <Briefcase size={24} />, label: 'Jobs & Services', desc: 'Find local work or hire trusted professionals near you.' },
  { icon: <ShoppingBag size={24} />, label: 'Community Market', desc: 'Buy, sell, or give away items with your neighbors.' },
  { icon: <MapPin size={24} />, label: 'Location Discovery', desc: 'Geo-fenced listings & interactive maps.' },
  { icon: <MessageCircle size={24} />, label: 'Real-time Chat', desc: 'Context-aware messaging tied to jobs and listings.' },
  { icon: <CircleDollarSign size={24} />, label: 'Secure Payments', desc: 'Escrow, digital wallet, multi-currency & mobile money.' },
  { icon: <Star size={24} />, label: 'Go Premium', desc: 'Priority placements, featured badges & elevated limits.' },
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
              <div className="hero-right animate-fade-in" style={{ animationDelay: '0.15s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: '560px',
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 24px 48px rgba(84, 101, 255, 0.15)',
                  border: '1px solid rgba(84, 101, 255, 0.1)'
                }}>
                  <img 
                    src="/hero_banner.png" 
                    alt="Luvio Neighborhood App Interface" 
                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                  />
                </div>
              </div>
            </div>

            {/* Trust bar */}
            <div className="hero-trust container animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { text: '210+ Countries', icon: <Globe size={18} /> },
                { text: 'Real-time Chat', icon: <MessageCircle size={18} /> },
                { text: 'Secure Escrow', icon: <Lock size={18} /> },
                { text: 'Web + Mobile', icon: <Smartphone size={18} /> }
              ].map((item, i, arr) => (
                <React.Fragment key={item.text}>
                  <span className="hero-trust-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon}
                    {item.text}
                  </span>
                  {i < arr.length - 1 && <span className="hero-trust-dot" />}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════
              HOW IT WORKS SECTION
              ════════════════════════════════════════ */}
          <section style={{ padding: 'var(--space-16) var(--space-4)', background: '#fff' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
                  How Luvio Works
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto' }}>
                  Connect with your neighborhood in three simple steps.
                </p>
              </div>

              <div className="grid grid-cols-3" style={{ gap: 'var(--space-2)', position: 'relative' }}>
                {/* Connecting Line Background (Desktop only) */}
                <div className="hiw-line-bg hidden md:block" />
                {/* Connecting Line Animated Fill (Desktop only) */}
                <div className="hiw-line-fill hidden md:block" />

                {[
                  { step: '1', title: 'Post a Job or Listing', desc: 'Describe what you need done, or snap a photo of what you want to sell locally.', icon: <PenLine size={32} /> },
                  { step: '2', title: 'Connect & Chat', desc: 'Review bids from verified neighbors, chat securely in real-time, and agree on details.', icon: <Handshake size={32} /> },
                  { step: '3', title: 'Complete Securely', desc: 'Pay via secure Escrow, get the job done, and build trust with a community rating.', icon: <CheckCircle size={32} /> },
                ].map((s) => (
                  <div key={s.step} className="hiw-card">
                    <div className="hiw-icon-wrap">
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>{s.icon}</span>
                    </div>
                    <div style={{ 
                      display: 'inline-block', padding: '2px 12px', background: 'var(--color-primary-50)', 
                      color: 'var(--color-primary-600)', borderRadius: '99px', fontSize: '0.75rem', 
                      fontWeight: 700, marginBottom: 'var(--space-3)' 
                    }}>
                      Step {s.step}
                    </div>
                    <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '1.25rem', marginBottom: 'var(--space-3)' }}>
                      {s.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              CTA SECTION
              ════════════════════════════════════════ */}
          <section style={{ padding: 'var(--space-20) var(--space-4)', textAlign: 'center', background: '#f8f9ff', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative background orbs for the glass effect to interact with */}
            <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'rgba(84, 101, 255, 0.4)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.6, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '0%', right: '10%', width: '500px', height: '500px', background: 'rgba(167, 139, 250, 0.3)', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.6, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '40%', left: '40%', width: '300px', height: '300px', background: 'rgba(96, 165, 250, 0.3)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.5, zIndex: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                borderRadius: '32px', 
                padding: 'var(--space-16) var(--space-8)', 
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 24px 64px rgba(84, 101, 255, 0.1)',
                color: 'var(--text-primary)',
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Inner shine */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)' }} />
                
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
                  Ready to Join Your <span style={{ color: 'var(--color-primary-600)' }}>Community?</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '30rem', margin: '0 auto var(--space-10)', lineHeight: '1.6', fontSize: '1.125rem' }}>
                  Sign up for free and start connecting, earning, and sharing with your neighborhood today.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/auth/register" className="btn btn-primary btn-lg" id="cta-register-btn"
                    style={{ padding: '0 32px', height: '56px', fontSize: '1.1rem', boxShadow: '0 12px 32px rgba(84,101,255,0.3)', borderRadius: '999px' }}>
                    Create Free Account
                  </Link>
                  <Link href="/jobs" className="btn btn-lg" id="cta-learn-btn"
                    style={{ padding: '0 32px', height: '56px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.7)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
                    Browse Jobs
                  </Link>
                </div>
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

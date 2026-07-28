'use client';

import React from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function PremiumPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Basic job posting', 'Standard marketplace listing', 'Community chat', 'Up to 3 active listings'],
      current: true,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      features: ['Premium profile badge ⭐', 'Priority in search results', 'Unlimited listings', 'Advanced analytics', 'Featured placement'],
      popular: true,
    },
    {
      name: 'Business',
      price: '$29.99',
      period: '/month',
      features: ['Everything in Premium', 'Business verification badge', 'Promoted listings', 'Priority support', 'Team accounts', 'Custom branding'],
    },
  ];

  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="container" style={{ padding: 'var(--space-12) var(--space-4)', textAlign: 'center' }}>
            <span className="badge badge-premium" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>⭐ Premium</span>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
              Upgrade Your <span className="gradient-text">Luvio</span> Experience
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto var(--space-10)' }}>
              Stand out with premium badges, get featured in search, and unlock unlimited listings.
            </p>

            <div className="grid grid-cols-3" style={{ maxWidth: '60rem', margin: '0 auto', gap: 'var(--space-6)' }}>
              {plans.map(plan => (
                <div
                  key={plan.name}
                  className="card"
                  style={{
                    padding: 'var(--space-8)',
                    textAlign: 'left',
                    position: 'relative',
                    border: plan.popular ? '2px solid var(--color-primary-500)' : undefined,
                  }}
                >
                  {plan.popular && (
                    <span className="badge badge-primary" style={{
                      position: 'absolute',
                      top: '-12px',
                      right: 'var(--space-4)',
                    }}>
                      Most Popular
                    </span>
                  )}
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                    {plan.name}
                  </h3>
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)' }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{plan.period}</span>
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--color-success)' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`btn ${plan.current ? 'btn-secondary' : plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%' }}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

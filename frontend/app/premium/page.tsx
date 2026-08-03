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
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="container" style={{ padding: 'var(--space-12) var(--space-4)', textAlign: 'center' }}>
          <span className="badge badge-premium" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>⭐ Premium</span>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
            Upgrade Your <span className="gradient-text">Luvio</span> Experience
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto var(--space-12)' }}>
            Get more visibility, priority placements, and powerful tools for your neighborhood listings.
          </p>

          <div className="grid grid-cols-3" style={{ gap: 'var(--space-6)', maxWidth: '64rem', margin: '0 auto' }}>
            {plans.map((plan) => (
              <div key={plan.name} className={`card ${plan.popular ? 'border-primary' : ''}`} style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'var(--space-8)',
              }}>
                {plan.popular && (
                  <span className="badge badge-primary" style={{ position: 'absolute', top: '-12px', right: 'var(--space-6)' }}>
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>{plan.name}</h3>
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)' }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{plan.period}</span>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-8) 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--color-success)' }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`btn ${plan.current ? 'btn-secondary' : plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                  disabled={plan.current}
                  id={`premium-plan-${plan.name.toLowerCase()}-btn`}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

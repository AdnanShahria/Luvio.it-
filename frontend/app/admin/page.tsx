'use client';

import React from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/layout';

export default function AdminPage() {
  const stats = [
    { label: 'Total Users', value: '0', icon: '👥', color: 'var(--color-primary-500)' },
    { label: 'Active Jobs', value: '0', icon: '💼', color: 'var(--color-accent-500)' },
    { label: 'Listings', value: '0', icon: '🛍️', color: 'var(--color-warning)' },
    { label: 'Revenue', value: '$0', icon: '💰', color: 'var(--color-success)' },
  ];

  const navItems = [
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/jobs', label: 'Jobs', icon: '💼' },
    { href: '/admin/marketplace', label: 'Marketplace', icon: '🛍️' },
    { href: '/admin/payments', label: 'Payments', icon: '💰' },
  ];

  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <Header />
      <main className="main-content">
        <div style={{ display: 'flex', minHeight: 'calc(100dvh - var(--header-height))' }}>
          {/* Sidebar */}
          <aside style={{
            width: '16rem',
            borderRight: '1px solid var(--border-color)',
            padding: 'var(--space-6)',
          }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)' }}>
              Admin Panel
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-secondary)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div style={{ flex: 1, padding: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)' }}>
              Dashboard Overview
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
              {stats.map((stat) => (
                <div key={stat.label} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{stat.label}</span>
                    <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🛠️</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>Admin Management</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Full admin dashboard coming in Phase 4
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

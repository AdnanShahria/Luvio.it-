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
    <AuthProvider>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div style={{ display: 'flex', minHeight: 'calc(100dvh - var(--header-height))' }}>
            {/* Sidebar */}
            <aside style={{
              width: 'var(--sidebar-width)',
              borderRight: '1px solid var(--border-color)',
              padding: 'var(--space-4)',
              background: 'var(--bg-secondary)',
            }}>
              <h2 style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-6)', padding: '0 var(--space-3)' }}>
                Admin
              </h2>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} className="header-nav-link" style={{ display: 'block', padding: 'var(--space-3)' }}>
                    {item.icon} {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, padding: 'var(--space-8)' }}>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)' }}>
                Dashboard Overview
              </h1>

              <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
                {stats.map(stat => (
                  <div key={stat.label} className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>{stat.label}</p>
                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginTop: 'var(--space-1)' }}>{stat.value}</p>
                      </div>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: 'var(--radius-lg)',
                        background: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Full admin dashboard coming in Phase 4
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}

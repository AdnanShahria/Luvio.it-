'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav, Footer } from '@/components/layout';

export default function WalletPage() {
  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <Header />
      <main className="main-content">
        <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)' }}>
            Wallet
          </h1>

          {/* Balance Card */}
          <div className="gradient-primary" style={{
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            color: 'white',
            marginBottom: 'var(--space-6)',
          }}>
            <p style={{ opacity: 0.8, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>Available Balance</p>
            <p style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)' }}>$0.00</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} id="wallet-deposit-btn">
                + Deposit
              </button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} id="wallet-withdraw-btn">
                ↗ Withdraw
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>Total Earned</p>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>$0.00</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>In Escrow</p>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>$0.00</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>Withdrawn</p>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>$0.00</p>
            </div>
          </div>

          {/* Transactions */}
          <h2 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>Recent Transactions</h2>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📊</div>
            <p style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

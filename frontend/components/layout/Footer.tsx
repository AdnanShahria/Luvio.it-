/**
 * Luvio Platform — Footer Component
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: 'var(--space-12) var(--space-4)',
      background: 'var(--bg-secondary)',
    }}>
      <div className="container">
        <div className="grid grid-cols-4" style={{ gap: 'var(--space-8)' }}>
          {/* Brand */}
          <div>
            <div className="header-logo" style={{ marginBottom: 'var(--space-3)' }}>
              <span className="gradient-text">Luvio</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
              Your neighborhood marketplace & community platform. Find local jobs, buy & sell items, and connect with neighbors.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link href="/jobs" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Jobs & Services</Link>
              <Link href="/marketplace" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Marketplace</Link>
              <Link href="/maps" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Explore</Link>
              <Link href="/premium" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Premium</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link href="/about" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>About</Link>
              <Link href="/privacy" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Terms of Service</Link>
              <Link href="/contact" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Contact</Link>
            </div>
          </div>

          {/* Download */}
          <div>
            <h4 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
              Get the App
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>📱 iOS — Coming Soon</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>🤖 Android — Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 'var(--space-10)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-tertiary)',
        }}>
          <span>© {currentYear} Luvio. All rights reserved.</span>
          <span>Built with ❤️ for neighborhoods everywhere</span>
        </div>
      </div>
    </footer>
  );
}

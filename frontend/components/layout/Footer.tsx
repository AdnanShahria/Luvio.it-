/**
 * Luvio Platform — Footer Component
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid rgba(84, 101, 255, 0.1)',
      padding: 'var(--space-16) var(--space-4) var(--space-8)',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle top glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-primary-300), transparent)', opacity: 0.5 }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="header-logo" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Luvio</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '360px' }}>
              Your neighborhood marketplace & community platform. Find local jobs, buy & sell items, and connect with neighbors safely and securely.
            </p>
          </div>

          <div className="footer-nav-row">
            {/* Platform */}
            <div className="footer-nav-col">
              <h4 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 'var(--space-6)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                Platform
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[
                  { label: 'Jobs & Services', href: '/jobs' },
                  { label: 'Marketplace', href: '/marketplace' },
                  { label: 'Explore', href: '/maps' },
                  { label: 'Premium', href: '/premium' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', transition: 'all 0.2s ease', display: 'inline-block' }} 
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-primary-600)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="footer-nav-col">
              <h4 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 'var(--space-6)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                Company
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[
                  { label: 'About Us', href: '/' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Contact Support', href: '/chat' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', transition: 'all 0.2s ease', display: 'inline-block' }} 
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-primary-600)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Download */}
          <div className="footer-app-col">
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 'var(--space-6)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              Get the App
            </h4>
            <div className="footer-app-buttons">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8f9ff', borderRadius: '12px', border: '1px solid rgba(84, 101, 255, 0.1)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                   onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-300)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                   onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(84, 101, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>
                  <svg viewBox="0 0 384 512" fill="currentColor" width="24" height="24">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Coming Soon</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>iOS App Store</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8f9ff', borderRadius: '12px', border: '1px solid rgba(84, 101, 255, 0.1)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                   onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-300)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                   onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(84, 101, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>
                  <svg viewBox="0 0 512 512" fill="currentColor" width="24" height="24">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Coming Soon</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar">
          <span>© {currentYear} Luvio. All rights reserved.</span>
          <span>
            Made by{' '}
            <a 
              href="https://orbitsaas.cloud" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary-600)', fontWeight: 700, textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary-700)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary-600)'}
            >
              OrbitSaaS
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

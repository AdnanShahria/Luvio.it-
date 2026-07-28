'use client';

/**
 * Luvio Platform — Header Component
 * Responsive header with glassmorphism, logo, nav links, and user actions.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/jobs', label: 'Jobs', icon: '💼' },
    { href: '/marketplace', label: 'Market', icon: '🛍️' },
    { href: '/maps', label: 'Explore', icon: '📍' },
  ];

  return (
    <header className={`header glass ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Logo */}
        <Link href="/" className="header-logo">
          <span className="gradient-text">Luvio</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav" role="navigation" aria-label="Main navigation">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="header-nav-link">
              <span style={{ marginRight: '4px' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <Link href="/notifications" className="btn btn-ghost btn-icon" aria-label="Notifications" id="header-notifications-btn">
                🔔
              </Link>
              <Link href="/chat" className="btn btn-ghost btn-icon" aria-label="Messages" id="header-chat-btn">
                💬
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  className="avatar avatar-md"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="User menu"
                  id="header-user-menu-btn"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} />
                  ) : (
                    user?.displayName?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </button>
                {menuOpen && (
                  <div
                    className="card animate-scale-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      minWidth: '12rem',
                      padding: 'var(--space-2)',
                      zIndex: 'var(--z-dropdown)',
                    }}
                  >
                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                        {user?.displayName}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        {user?.email || user?.phone}
                      </div>
                    </div>
                    <Link href="/profile" className="header-nav-link" style={{ display: 'block', padding: 'var(--space-2) var(--space-4)' }} onClick={() => setMenuOpen(false)}>
                      👤 Profile
                    </Link>
                    <Link href="/wallet" className="header-nav-link" style={{ display: 'block', padding: 'var(--space-2) var(--space-4)' }} onClick={() => setMenuOpen(false)}>
                      💰 Wallet
                    </Link>
                    <Link href="/profile/settings" className="header-nav-link" style={{ display: 'block', padding: 'var(--space-2) var(--space-4)' }} onClick={() => setMenuOpen(false)}>
                      ⚙️ Settings
                    </Link>
                    <button
                      className="header-nav-link"
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-4)', color: 'var(--color-error)' }}
                      onClick={() => { logout(); setMenuOpen(false); }}
                      id="header-logout-btn"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost" id="header-login-btn">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn btn-primary" id="header-register-btn">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .header-scrolled {
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </header>
  );
}

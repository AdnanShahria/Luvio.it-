'use client';

/**
 * Luvio Platform — Header Component
 * Floating pill-shaped navbar: [logo + brand] [nav links] [sign in + dashboard]
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/jobs',        label: 'Jobs'    },
    { href: '/marketplace', label: 'Market'  },
    { href: '/maps',        label: 'Explore' },
  ];

  return (
    <>
      <header className={`nav-strip ${scrolled ? 'nav-strip--scrolled' : ''}`}>
        <nav className="nav-inner" role="navigation" aria-label="Main navigation">

          {/* LEFT: logo + brand */}
          <div className="nav-left" suppressHydrationWarning>
            <Link href="/" className="nav-logo-circle" aria-label="Home">
              <img src="/logo.png" alt="Luvio Logo" className="nav-logo-img" width={36} height={36} />
            </Link>
            <Link href="/" className="nav-brand-card">
              <span className="nav-brand-name">Luvio</span>
            </Link>
          </div>

          {/* CENTRE: nav links (Segmented Pill) */}
          <div className="nav-center" suppressHydrationWarning>
            <div className="nav-links-pill" suppressHydrationWarning>
              {navLinks.map((l, index) => (
                <React.Fragment key={l.href}>
                  <Link href={l.href} className="nav-link-segment">
                    {l.label}
                  </Link>
                  {index < navLinks.length - 1 && <div className="nav-segment-divider" suppressHydrationWarning />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT: actions / dashboard card */}
          <div className="nav-right" suppressHydrationWarning>
            {isAuthenticated ? (
              <div className="nav-actions-card">
                <Link href="/profile" className="nav-dashboard-card" id="header-dashboard-btn" style={{ padding: '8px 16px', marginRight: '8px' }}>Dashboard</Link>
                <Link href="/notifications" className="nav-icon-btn" aria-label="Notifications" id="header-notifications-btn">🔔</Link>
                <Link href="/chat"          className="nav-icon-btn" aria-label="Messages"      id="header-chat-btn">💬</Link>
                <div style={{ position: 'relative' }}>
                  <button
                    className="avatar avatar-md nav-avatar-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="User menu"
                    id="header-user-menu-btn"
                  >
                    {user?.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.displayName} width={36} height={36} />
                      : user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </button>

                  {menuOpen && (
                    <div className="card animate-scale-in" style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      minWidth: '12rem', padding: 'var(--space-2)', zIndex: 'var(--z-dropdown)',
                    }}>
                      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.displayName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user?.email || user?.phone}</div>
                      </div>
                      {[
                        { href: '/profile',          label: '👤 Profile'  },
                        { href: '/wallet',           label: '💰 Wallet'   },
                        { href: '/profile/settings', label: '⚙️ Settings' },
                      ].map(item => (
                        <Link key={item.href} href={item.href} className="header-nav-link"
                          style={{ display: 'block', padding: 'var(--space-2) var(--space-4)' }}
                          onClick={() => setMenuOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                      <button className="header-nav-link"
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-4)', color: 'var(--color-error)' }}
                        onClick={() => { logout(); setMenuOpen(false); }}
                        id="header-logout-btn">
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="nav-auth-card" suppressHydrationWarning>
                <Link href="/auth/login" className="nav-signin-text" id="header-login-btn">Sign In</Link>
                <Link href="/auth/register" className="nav-dashboard-card" id="header-signup-btn">Sign Up</Link>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}

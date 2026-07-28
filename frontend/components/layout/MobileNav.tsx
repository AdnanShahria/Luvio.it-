'use client';

/**
 * Luvio Platform — Mobile Bottom Navigation
 * Fixed bottom nav bar for mobile devices with active state.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/jobs', label: 'Jobs', icon: '💼' },
  { href: '/marketplace', label: 'Market', icon: '🛍️' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav glass" role="navigation" aria-label="Mobile navigation">
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            id={`mobile-nav-${item.label.toLowerCase()}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

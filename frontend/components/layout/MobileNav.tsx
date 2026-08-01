'use client';

/**
 * Luvio Platform — Mobile Bottom Navigation
 * Fixed bottom nav bar for mobile devices with active state.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, ShoppingBag, MessageSquare, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const activeIndex = navItems.findIndex(item => pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)));

  return (
    <nav className="mobile-nav glass" role="navigation" aria-label="Mobile navigation">
      <div 
        className="nav-active-indicator"
        style={{
          transform: `translateX(${activeIndex >= 0 ? activeIndex * 100 : 0}%)`,
          opacity: activeIndex >= 0 ? 1 : 0,
          width: `${100 / navItems.length}%`
        }}
      >
        <div className="nav-active-pill" />
      </div>
      {navItems.map((item, index) => {
        const isActive = activeIndex === index;
        const IconComponent = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            id={`mobile-nav-${item.label.toLowerCase()}`}
          >
            <span className="nav-icon">
              <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

/**
 * Luvio Platform — Root Route Template
 * Handles page transition animations on route changes across the app.
 */

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition-container" suppressHydrationWarning>
      {children}
    </div>
  );
}

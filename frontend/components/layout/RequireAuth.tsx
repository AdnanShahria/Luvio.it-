'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        padding: '100px 20px', textAlign: 'center', minHeight: '60vh' 
      }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--color-primary-600)' }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Please sign in to your account to access this page and interact with the Luvio community.
        </p>
        <Link href="/auth/login" className="btn btn-primary btn-lg" style={{ 
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 36px', height: '56px', borderRadius: '999px',
          fontSize: '1.1rem', fontWeight: 600,
          boxShadow: '0 12px 32px rgba(84,101,255,0.3)',
          textDecoration: 'none'
        }}>
          Sign In to Continue
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

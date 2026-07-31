'use client';

/**
 * Luvio Platform — Login Page
 * Email/Phone + password login with social auth options.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="header-logo" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>
            <span className="gradient-text" style={{ fontSize: 'var(--font-size-3xl)' }}>Luvio</span>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to your account</p>
        </div>

        {/* Social Login */}
        <div className="auth-social-buttons" style={{ marginBottom: 'var(--space-6)' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} id="login-google-btn" type="button" onClick={() => alert('Social authentication is coming soon!')}>
            <span>🔵</span> Google
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} id="login-apple-btn" type="button" onClick={() => alert('Social authentication is coming soon!')}>
            <span>🍎</span> Apple
          </button>
        </div>

        <div className="auth-divider">or continue with email</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email" className="input-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password" className="input-label">Password</label>
              <Link href="/auth/reset-password" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-tertiary)',
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            id="login-submit-btn"
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: 'white' }} /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}

'use client';

/**
 * Luvio Platform — Password Reset Page
 * Request a password reset email.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/password/reset', { email }, { skipAuth: true });
      if (response.success) {
        setSuccess(true);
      } else {
        // Still show success to prevent email enumeration
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <Link href="/" className="header-logo" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>
            <span className="gradient-text" style={{ fontSize: 'var(--font-size-3xl)' }}>Luvio</span>
          </Link>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔐</div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {success
              ? 'Check your email for a reset link'
              : 'Enter your email and we\'ll send you a reset link'}
          </p>
        </div>

        {success ? (
          <div className="animate-scale-in">
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              fontSize: '2rem',
            }}>
              ✅
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
              If an account with that email exists, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
            </p>
            <Link href="/auth/login" className="btn btn-primary" id="reset-back-to-login-btn">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label htmlFor="reset-email" className="input-label">Email Address</label>
              <input
                id="reset-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="error-message" style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-md)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              id="reset-submit-btn"
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <><span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: 'white' }} /> Sending...</>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link href="/auth/login" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

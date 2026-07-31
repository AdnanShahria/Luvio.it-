'use client';

/**
 * Luvio Platform — Set New Password Page
 * Allows users to set a new password using a reset token.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Simplified password validation (just length is checked by HTML input attribute)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }



    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/password/set', { token, password }, { skipAuth: true });
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to update password');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <Link href="/" className="header-logo" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>
              <span className="gradient-text" style={{ fontSize: 'var(--font-size-3xl)' }}>Luvio</span>
            </Link>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
            <h1 className="auth-title">Password Updated</h1>
            <p className="auth-subtitle">Your password has been successfully changed.</p>
          </div>
          <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', display: 'inline-block' }}>
            Sign In with New Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="header-logo" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>
            <span className="gradient-text" style={{ fontSize: 'var(--font-size-3xl)' }}>Luvio</span>
          </Link>
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">Choose a strong password for your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="set-password" className="input-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="set-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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

          <div className="input-group">
            <label htmlFor="confirm-password" className="input-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className={`input ${confirmPassword && password !== confirmPassword ? 'input-error' : ''}`}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <span className="error-message">Passwords do not match</span>
            )}
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
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: 'white' }} /> Updating...</>
            ) : (
              'Set Password'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/auth/login" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

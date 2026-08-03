'use client';

/**
 * Luvio Platform — Register Page
 * Multi-field registration with email/phone, display name, and password.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Simplified password validation (just length is checked by HTML input attribute)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }



    setIsLoading(true);

    try {
      const result = await register({
        email,
        password,
        displayName,
      });

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Registration failed');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join your neighborhood community today</p>
        </div>

        {/* Social Register */}
        <div className="auth-social-buttons" style={{ marginBottom: 'var(--space-6)' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} id="register-google-btn" type="button" onClick={() => alert('Social authentication is coming soon!')}>
            <span>🔵</span> Google
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} id="register-apple-btn" type="button" onClick={() => alert('Social authentication is coming soon!')}>
            <span>🍎</span> Apple
          </button>
        </div>

        <div className="auth-divider">or register with email</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="register-name" className="input-label">Display Name</label>
            <input
              id="register-name"
              type="text"
              className="input"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="register-email" className="input-label">Email Address</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
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
            <label htmlFor="register-confirm-password" className="input-label">Confirm Password</label>
            <input
              id="register-confirm-password"
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
            id="register-submit-btn"
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: 'white' }} /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            By creating an account, you agree to our{' '}
            <Link href="/terms" style={{ fontWeight: 'var(--font-weight-medium)' }}>Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ fontWeight: 'var(--font-weight-medium)' }}>Privacy Policy</Link>.
          </p>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/auth/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}

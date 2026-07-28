'use client';

/**
 * Luvio Platform — OTP Verification Page
 * 6-digit code input with auto-advance and resend functionality.
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every(d => d)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Phone would come from query params or context
      const phone = new URLSearchParams(window.location.search).get('phone') || '';
      const response = await api.post('/auth/otp/verify', { phone, code }, { skipAuth: true });

      if (response.success) {
        router.push('/');
      } else {
        setError(response.error || 'Invalid verification code');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const phone = new URLSearchParams(window.location.search).get('phone') || '';
    await api.post('/auth/otp/request', { phone }, { skipAuth: true });
    setResendTimer(60);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <Link href="/" className="header-logo" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>
            <span className="gradient-text" style={{ fontSize: 'var(--font-size-3xl)' }}>Luvio</span>
          </Link>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📱</div>
          <h1 className="auth-title">Verify Your Phone</h1>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to your phone number
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="otp-inputs" onPaste={handlePaste} style={{ marginBottom: 'var(--space-6)' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="otp-input"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Digit ${index + 1}`}
              id={`otp-input-${index}`}
            />
          ))}
        </div>

        {error && (
          <div className="error-message" style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}>
            {error}
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <span className="spinner" />
          </div>
        )}

        {/* Resend */}
        <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          {resendTimer > 0 ? (
            <span>Resend code in {resendTimer}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="btn btn-ghost"
              id="otp-resend-btn"
              style={{ color: 'var(--color-primary-500)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Resend Code
            </button>
          )}
        </div>

        <div className="auth-footer" style={{ marginTop: 'var(--space-8)' }}>
          <Link href="/auth/login" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

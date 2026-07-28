/**
 * Luvio Platform — Auth Service
 * Core authentication business logic: password hashing, OTP, JWT tokens.
 * Uses Web Crypto API (Cloudflare Workers compatible — no Node.js crypto).
 */

import { eq, and } from 'drizzle-orm';
import type { Database } from '../db';
import { schema } from '../db';
import { createJWT } from '../middleware/auth';

// ============================================
// Password Hashing (PBKDF2 via Web Crypto)
// ============================================

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );

  const hash = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');

  return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const iterations = parseInt(parts[1]);
  const salt = new Uint8Array(parts[2].match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const expectedHash = parts[3];

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  );

  const actualHash = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return actualHash === expectedHash;
}

// ============================================
// OTP Generation
// ============================================

function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map(v => digits[v % 10]).join('');
}

// ============================================
// Auth Service Class
// ============================================

export class AuthService {
  constructor(
    private db: Database,
    private jwtSecret: string,
    private refreshSecret: string,
    private jwtExpiresIn: string = '7d',
    private refreshExpiresIn: string = '30d',
  ) {}

  /**
   * Register a new user with email/phone + password.
   */
  async register(input: {
    email?: string;
    phone?: string;
    phoneCountryCode?: string;
    password: string;
    displayName: string;
  }) {
    // Check for existing user
    if (input.email) {
      const existing = await this.db.query.users.findFirst({
        where: eq(schema.users.email, input.email),
      });
      if (existing) throw new Error('Email already registered');
    }

    if (input.phone) {
      const existing = await this.db.query.users.findFirst({
        where: eq(schema.users.phone, input.phone),
      });
      if (existing) throw new Error('Phone number already registered');
    }

    const passwordHash = await hashPassword(input.password);

    const [user] = await this.db.insert(schema.users).values({
      email: input.email || null,
      phone: input.phone || null,
      phoneCountryCode: input.phoneCountryCode || null,
      passwordHash,
      displayName: input.displayName,
      isVerified: false,
    }).returning();

    // Create wallet for the user
    await this.db.insert(schema.wallets).values({
      userId: user.id,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login with email/phone + password.
   */
  async login(input: { email?: string; phone?: string; password: string }) {
    let user;

    if (input.email) {
      user = await this.db.query.users.findFirst({
        where: eq(schema.users.email, input.email),
      });
    } else if (input.phone) {
      user = await this.db.query.users.findFirst({
        where: eq(schema.users.phone, input.phone),
      });
    }

    if (!user) throw new Error('Invalid credentials');
    if (user.isBlocked) throw new Error('Account has been suspended');

    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) throw new Error('Invalid credentials');

    // Update last login
    await this.db.update(schema.users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(schema.users.id, user.id));

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Request an OTP code for phone verification.
   */
  async requestOTP(phone: string) {
    const code = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Find user by phone (may not exist yet during registration)
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.phone, phone),
    });

    await this.db.insert(schema.otpCodes).values({
      userId: user?.id || null,
      phone,
      code,
      expiresAt,
    });

    // TODO: Send OTP via SMS service (Twilio, MessageBird, etc.)
    // For development, log the code
    console.log(`[DEV OTP] Phone: ${phone}, Code: ${code}`);

    return { message: 'OTP sent successfully', expiresIn: 600 };
  }

  /**
   * Verify an OTP code.
   */
  async verifyOTP(phone: string, code: string) {
    const otpRecord = await this.db.query.otpCodes.findFirst({
      where: and(
        eq(schema.otpCodes.phone, phone),
        eq(schema.otpCodes.code, code),
        eq(schema.otpCodes.verified, false),
      ),
    });

    if (!otpRecord) throw new Error('Invalid OTP code');

    // Check expiration
    if (new Date(otpRecord.expiresAt) < new Date()) {
      throw new Error('OTP code has expired');
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      throw new Error('Too many verification attempts');
    }

    // Mark as verified
    await this.db.update(schema.otpCodes)
      .set({ verified: true })
      .where(eq(schema.otpCodes.id, otpRecord.id));

    // If user exists, mark phone as verified
    if (otpRecord.userId) {
      await this.db.update(schema.users)
        .set({ isVerified: true })
        .where(eq(schema.users.id, otpRecord.userId));
    }

    return { verified: true };
  }

  /**
   * Request a password reset (sends email with reset token).
   */
  async requestPasswordReset(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    // Don't reveal if user exists
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    // Generate a reset token (stored as a refresh token with short expiry)
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await this.db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: `reset:${resetToken}`,
      expiresAt,
    });

    // TODO: Send email with reset link
    console.log(`[DEV RESET] User: ${email}, Token: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Set a new password using a reset token.
   */
  async resetPassword(token: string, newPassword: string) {
    const record = await this.db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.token, `reset:${token}`),
    });

    if (!record) throw new Error('Invalid or expired reset token');
    if (new Date(record.expiresAt) < new Date()) throw new Error('Reset token has expired');

    const passwordHash = await hashPassword(newPassword);

    await this.db.update(schema.users)
      .set({ passwordHash, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, record.userId));

    // Delete the used reset token
    await this.db.delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, record.id));

    return { message: 'Password updated successfully' };
  }

  /**
   * Refresh access token using a refresh token.
   */
  async refreshToken(refreshToken: string) {
    const record = await this.db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.token, refreshToken),
    });

    if (!record) throw new Error('Invalid refresh token');
    if (new Date(record.expiresAt) < new Date()) {
      // Clean up expired token
      await this.db.delete(schema.refreshTokens)
        .where(eq(schema.refreshTokens.id, record.id));
      throw new Error('Refresh token has expired');
    }

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, record.userId),
    });

    if (!user) throw new Error('User not found');

    // Rotate refresh token
    await this.db.delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, record.id));

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) throw new Error('User not found');
    return this.sanitizeUser(user);
  }

  /**
   * Delete user account and all associated data.
   */
  async deleteAccount(userId: string) {
    // Cascading deletes will handle related records
    await this.db.delete(schema.users)
      .where(eq(schema.users.id, userId));

    return { message: 'Account deleted successfully' };
  }

  // ============================================
  // Private Helpers
  // ============================================

  private async generateTokens(userId: string, role: string) {
    const accessToken = await createJWT(
      { sub: userId, role },
      this.jwtSecret,
      this.jwtExpiresIn
    );

    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + this.parseExpiry(this.refreshExpiresIn) * 1000).toISOString();

    await this.db.insert(schema.refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.jwtExpiresIn),
    };
  }

  private parseExpiry(str: string): number {
    const match = str.match(/^(\d+)([dhms])$/);
    const multipliers: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };
    return match ? parseInt(match[1]) * (multipliers[match[2]] || 86400) : 604800;
  }

  private sanitizeUser(user: typeof schema.users.$inferSelect) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

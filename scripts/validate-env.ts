/**
 * Luvio Platform — Environment Variable Validator
 * Runs at build time to ensure all required secrets are configured.
 * Usage: npx tsx scripts/validate-env.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface EnvRule {
  key: string;
  required: boolean;
  description: string;
  sensitive: boolean; // If true, value is masked in logs
}

const ENV_RULES: EnvRule[] = [
  // Database
  { key: 'D1_DATABASE_ID', required: true, description: 'Cloudflare D1 database ID', sensitive: false },

  // Auth
  { key: 'JWT_SECRET', required: true, description: 'JWT signing secret (min 32 chars)', sensitive: true },
  { key: 'REFRESH_TOKEN_SECRET', required: true, description: 'Refresh token signing secret', sensitive: true },

  // OAuth (required for social login)
  { key: 'GOOGLE_CLIENT_ID', required: false, description: 'Google OAuth client ID', sensitive: false },
  { key: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Google OAuth client secret', sensitive: true },
  { key: 'APPLE_CLIENT_ID', required: false, description: 'Apple Sign-In client ID', sensitive: false },

  // OTP
  { key: 'OTP_SERVICE_API_KEY', required: false, description: 'SMS OTP provider API key', sensitive: true },

  // Payments
  { key: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key', sensitive: true },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret', sensitive: true },

  // Storage
  { key: 'R2_BUCKET_NAME', required: false, description: 'Cloudflare R2 bucket name', sensitive: false },

  // Maps
  { key: 'MAPBOX_ACCESS_TOKEN', required: false, description: 'Mapbox GL access token', sensitive: true },

  // Public (safe to expose)
  { key: 'NEXT_PUBLIC_API_URL', required: true, description: 'Public API base URL', sensitive: false },
  { key: 'NEXT_PUBLIC_APP_NAME', required: false, description: 'Application display name', sensitive: false },
];

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const content = readFileSync(path, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && value) env[key] = value;
  }
  return env;
}

function validate(): void {
  console.log('\n🔐 Luvio Environment Validator\n');
  console.log('━'.repeat(60));

  const envPath = resolve(process.cwd(), '.env');
  const fileEnv = loadEnvFile(envPath);
  const allEnv = { ...fileEnv, ...process.env };

  let hasErrors = false;
  let warnings = 0;

  for (const rule of ENV_RULES) {
    const value = allEnv[rule.key];
    const present = !!value && value.length > 0;
    const display = present
      ? rule.sensitive
        ? `${'*'.repeat(Math.min(value!.length, 8))}...`
        : value!.substring(0, 30)
      : '(empty)';

    if (rule.required && !present) {
      console.log(`  ❌  ${rule.key} — MISSING (required)`);
      console.log(`      ${rule.description}`);
      hasErrors = true;
    } else if (!rule.required && !present) {
      console.log(`  ⚠️  ${rule.key} — not set (optional)`);
      warnings++;
    } else {
      console.log(`  ✅  ${rule.key} = ${display}`);
    }
  }

  console.log('━'.repeat(60));

  if (hasErrors) {
    console.log('\n💥 Validation FAILED — missing required environment variables.');
    console.log('   Copy .env.example to .env and fill in the required values.\n');
    process.exit(1);
  }

  if (warnings > 0) {
    console.log(`\n⚠️  ${warnings} optional variables not set. Some features may be disabled.\n`);
  } else {
    console.log('\n✅ All environment variables validated successfully.\n');
  }
}

validate();

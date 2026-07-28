# Luvio Platform

A multi-faceted neighborhood marketplace and community platform. Find local jobs, buy & sell items, and connect with your community — all from one platform.

## 🏗️ Architecture

Monorepo with mirrored frontend/backend microservice-style structure:

```
├── frontend/          # Next.js 14 (App Router, TypeScript, Vanilla CSS)
│   └── app/
│       ├── auth/      → backend/auth/
│       ├── jobs/      → backend/jobs/
│       ├── marketplace/ → backend/marketplace/
│       ├── chat/      → backend/chat/
│       ├── wallet/    → backend/wallet/
│       ├── profile/   → backend/profile/
│       ├── notifications/ → backend/notifications/
│       ├── maps/      → backend/maps/
│       ├── premium/   → backend/premium/
│       └── admin/     → backend/admin/
│
├── backend/           # Cloudflare Workers (Hono framework)
│   ├── auth/          # Auth service (JWT, OTP, OAuth)
│   ├── jobs/          # Jobs & bidding
│   ├── marketplace/   # Buy/sell/give listings
│   ├── chat/          # Real-time WebSocket chat
│   ├── wallet/        # Payments, escrow, transactions
│   ├── profile/       # User profiles & settings
│   ├── notifications/ # Push & in-app notifications
│   ├── maps/          # Geo queries & nearby search
│   ├── premium/       # Subscriptions & premium features
│   ├── admin/         # Admin dashboard API
│   └── db/            # Drizzle ORM + D1 schema
│
├── shared/            # Shared types, validators (Zod), constants
└── scripts/           # Build & DevOps utilities
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in the required values in .env

# 3. Validate environment
npm run validate:env

# 4. Start development servers
npm run dev
```

## 📱 API for Mobile (Flutter)

All backend endpoints are fully REST-compatible with JSON responses:
- Auth: Bearer JWT tokens (no cookies)
- Response envelope: `{ success, data, error, meta }`
- Base URL: `/api/v1/`
- WebSocket: `/ws?token=<jwt>`

## 🔒 Environment Security

- `.env` at root — **never committed** (in `.gitignore`)
- `.env.example` — committed template with empty values
- `scripts/validate-env.ts` — build-time validation
- Only `NEXT_PUBLIC_*` vars exposed to browser
- Secrets set in Cloudflare via `wrangler secret put`

## 🌐 Deployment

Single Cloudflare Pages project:
```bash
npm run deploy
```

## 📋 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Vanilla CSS |
| Backend | Hono (Cloudflare Workers) |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Real-time | Cloudflare Durable Objects + WebSockets |
| Storage | Cloudflare R2 |
| Auth | Custom JWT + PBKDF2 |
| Validation | Zod (shared) |
| Payments | Stripe |
| Maps | Mapbox GL |
| Mobile | Flutter (Dart) — separate repo |
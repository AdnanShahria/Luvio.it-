# Product Requirements Document (PRD): Luvio Platform

## 1. Executive Summary
**Project Name:** Luvio Platform Rebuild
**Objective:** A full-scale, ground-up rebuild of the existing Luvio MVP into a high-performance, edge-native ecosystem. Luvio is a multi-faceted neighborhood marketplace and community platform supporting a responsive Web application, a native Android app, and a native iOS app.

## 2. Tech Stack Overview
*   **Web Platform:** Next.js (React, TypeScript) - Server-Side Rendering (SSR) for maximum SEO.
*   **Mobile Applications:** Flutter (Dart) - Native performance across iOS and Android.
*   **Backend API:** Cloudflare Workers (Hono) - Edge-native, zero-cold-start backend.
*   **Database Engine:** Cloudflare D1 - High-concurrency relational data engine. and Turso  as backup .
*   **Real-time Chat:** Cloudflare WebSockets - Persistent, stateful edge WebSockets.

## 3. Core Features & Scope

### 3.1 Authentication, Account, Privacy & Safety
*   **Multi-Role Accounts:** Unified account structure to dynamically switch between Customer, Worker, and Seller roles.
*   **Global Onboarding & OTP:** International mobile phone registration with country code/flag picker (210+ countries) and OTP alongside standard email sign-up.
*   **Social Authentication:** Google Sign-In and Apple Sign-In.
*   **Security & Recovery:** Secure password reset, email verification workflows with trust badges, secure authentication (password hashing, HTTPS, rate limiting).
*   **Account Management:** Profile avatar customization, currency selection, account type configuration, and account deletion from inside the app.
*   **Privacy & Controls:** Location permission controls, location privacy, camera/photo permission controls, and appropriate personal-data deletion/retention workflow.
*   **Safety Tools:** User blocking, reporting, abuse/spam reporting, and moderation tools.

### 3.2 Jobs & Services Marketplace
*   **Job Posting Engine:** Multi-step job publishing (multi-image uploads, detailed instructions, budget settings, preferred payment mode).
*   **Bidding & Offer System:** Interactive bidding workflow for verified workers to submit formal offers.
*   **Service Lifecycle:** Hiring flow → In-app Real-time Chat → Job Completion → Mutual Rating & Reviews.

### 3.3 Community Market (Buy, Sell & Give Away)
*   **Listing Engine:** Classifieds post creation (9 categories) with multi-image showcase (up to 5 high-res photos via interactive carousel).
*   **Direct Engagement:** Direct buyer-seller chat initiation from listing pages and seller profile review cards.
*   **Safety:** In-app reporting framework for flagging inappropriate listings.

### 3.4 Maps & Location-Based Features
*   **Current Location:** Detection of user's current geographical location.
*   **Discovery:** Geo-fenced job feed and nearby marketplace listings.
*   **Filtering:** Distance calculation, proximity-based search with distance sorting, and location-based filtering (city filters, category chips).
*   **Interactive Maps:** Interactive map view and location pins for jobs/services.

### 3.5 Real-time Chat & Messaging
*   **1:1 Direct Threads:** Context-aware chat threads tied to specific jobs or listings.
*   **Delivery:** Instant delivery via persistent WebSockets with push notification fallbacks.

### 3.6 Payments, Wallet & Escrow
*   **Escrow System:** Secure transaction architecture to hold and release funds upon confirmed job completion.
*   **Digital Wallet:** Interface displaying multi-currency balances, total earnings, and withdrawal tracking.
*   **Supported Methods:** Clear definition of supported countries/currencies, cards, bank transfers, mobile money, and wallet methods.
*   **Fees & Settlement:** Definition of transaction fees (and who pays them) and mutual confirmation workflows for in-person cash settlement.

### 3.7 Premium & Advertising
*   **Visibility:** Premium profile badges, profile visibility, and featured listings/search placement.
*   **Subscriptions:** Premium/Business subscription management tiers granting elevated limits.

### 3.8 Notifications & Internationalization (i18n)
*   **Notification Center:** In-app hub with unread badges.
*   **Push Notifications:** Real-time alerts for bids, hiring confirmation, completed tasks, and messages.
*   **Multi-Language:** Support for 13 languages (including English, Spanish, Arabic RTL, Hindi, Bangla) with automatic device locale detection.

### 3.9 Owner Admin Dashboard
*   **Marketplace Management:** Manage jobs, services, marketplace listings, and categories.
*   **Financial Oversight:** View payments, withdrawals, refunds, and transaction history.

## 4. Final Testing & Acceptance
Final delivery, payment, and acceptance are tied to a documented acceptance checklist covering:
*   Android, iOS, and Web platforms.
*   Registration, OTP, and profiles.
*   Jobs, marketplace, chat, and maps.
*   Notifications, payments, digital wallet, and Premium features.
*   Reviews, admin dashboard, account deletion, security, backups, and app store submission.

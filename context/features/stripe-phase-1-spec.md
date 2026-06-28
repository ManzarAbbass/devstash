# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Set up the foundational Stripe infrastructure: install the SDK, configure environment variables, create the Stripe client singleton, update NextAuth to sync `isPro` in the JWT session, and implement the usage-limits module with unit tests.

## Requirements

- Install `stripe` npm package
- Add 5 Stripe env vars to `.env.example` (secret key, publishable key, webhook secret, monthly price ID, yearly price ID)
- Create `src/lib/stripe.ts` — Stripe client singleton with `apiVersion: "2025-02-24.acacia"` and price ID constants
- Update `src/types/next-auth.d.ts` — add `isPro: boolean` to `Session.user`
- Update `src/auth.ts` — add `jwt` callback that syncs `isPro` from DB on every token validation; update `session` callback to inject `isPro` from token
- Create `src/lib/constants.ts` with `FREE_TIER_MAX_ITEMS = 50` and `FREE_TIER_MAX_COLLECTIONS = 3`
- Create `src/lib/pro.ts` with exported helpers:
  - `getProStatus()` — returns `boolean` from session
  - `checkItemLimit(userId, isPro)` — returns `ProCheckResult`
  - `checkCollectionLimit(userId, isPro)` — returns `ProCheckResult`
  - `checkFileUploadAllowed(isPro)` — returns `ProCheckResult`
- Write unit tests for `src/lib/pro.ts` covering:
  - Free user within item limit returns `{ allowed: true }`
  - Free user at item limit returns `{ allowed: false, reason: "..." }`
  - Pro user always passes item limit check
  - Free user within collection limit returns `{ allowed: true }`
  - Free user at collection limit returns `{ allowed: false, reason: "..." }`
  - Pro user always passes collection limit check
  - Free user fails file upload check
  - Pro user always passes file upload check
  - `getProStatus()` returns `false` when no session, `session.user.isPro` when present
- Tests must mock Prisma (`prisma.item.count`, `prisma.collection.count`) and NextAuth (`auth()`)

# Current Feature: Rate Limiting for Auth

## Status

In Progress

## Goals

- Add rate limiting to auth-related API routes using Upstash Redis and `@upstash/ratelimit`
- Create reusable `src/lib/rate-limit.ts` utility with sliding window algorithm
- Return 429 Too Many Requests with `Retry-After` header and user-friendly error messages
- Protect login (5/15min per IP+email), register (3/1h per IP), forgot-password (3/1h per IP), reset-password (5/15min per IP), resend-verification (3/15min per IP+email)
- Display rate limit errors via toast notifications on the frontend
- Fail open (allow request) if Upstash is unavailable

## Notes

- Upstash free tier: 10k requests/day (sufficient for auth limiting)
- Login limiting may need a custom NextAuth sign-in handler
- Extract IP from `x-forwarded-for` header (Vercel) or `req.socket.remoteAddress`
- Rate limiting should fail open — never block users due to Redis outage
- Consider adding rate limiting middleware for cleaner implementation later
- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars

## History

- 2026-05-23: Dashboard UI Phase 1 — ShadCN init, layout, dark mode, top bar, placeholders [Completed]
- 2026-05-23: Dashboard UI Phase 2 — Collapsible sidebar with icon collapse, toggle in sidebar, centered search [Completed]
- 2026-05-23: Dashboard UI Phase 2 (redo) — Sidebar redesign: collapsible to icons, toggle inside, Nav heading, centered search [Completed]
- 2026-05-23: Dashboard UI Phase 3 — Main content with stats cards, collections grid, pinned + recent items [Completed]
- 2026-05-25: Prisma + Neon PostgreSQL Setup — Initial setup and schema generation [Completed]
- 2026-05-25: Seed Script — Populate database with sample data for development and demos [Completed]
- 2026-05-25: Dashboard Collections — Replace mock data with real data from the database [Completed]
- 2026-05-25: Dashboard Items — Replace dummy item data with real data from the database [Completed]
- 2026-05-25: Stats & Sidebar — Replace mock data with real database stats and populate sidebar with item types + collections [Completed]
- 2026-06-03: Add Pro Badge to Sidebar — Added PRO badge to Files and Images item types in the sidebar using ShadCN UI Badge [Completed]
- 2026-06-10: Fix N+1 queries in collection stats and sidebar — Replaced eager-loading N+1 with aggregation queries in `getCollections()` and `getSidebarCollections()`, added `@@index([collectionId])` on ItemCollection [Completed]
- 2026-06-11: Auth Phase 1 — NextAuth v5 with GitHub OAuth, split config pattern, dashboard proxy protection, JWT session [Completed]
- 2026-06-11: Auth Phase 2 — Email/password Credentials provider with bcrypt validation, registration API route, dashboard user auth fix [Completed]
- 2026-06-12: Auth UI Phase 3 — Custom /sign-in and /register pages, sidebar avatar dropdown with Profile + Sign out, sonner toasts, autofill attributes, DropdownMenu component [Completed]
- 2026-06-13: Email Verification — Register sends verification email via Resend, 24h token, blocks unverified sign-in, improved auth UI [Completed]
- 2026-06-13: Email Verification Toggle — EMAIL_VERIFICATION env var to enable/disable verification, frontend adapts accordingly [Completed]
- 2026-06-13: Forgot / Reset Password — "Forgot password?" link on sign-in, forgot-password page sends reset email via Resend, reset-password page with token-based new password entry, API routes for both, uses VerificationToken model with 1-hour expiry, follows existing auth UI patterns [Completed]
- 2026-06-13: Profile Page — Profile page at /profile with user info (avatar, email, join date), usage stats (total items, collections, per-type breakdown), change password (email users only), delete account with confirmation dialog [Completed]

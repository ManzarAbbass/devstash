# Current Feature: Forgot / Reset Password

## Status

In Progress

## Goals

- Add "Forgot password?" link on sign-in page
- Forgot password page — enter email, send reset link
- Reset password page — enter new password via token URL
- API routes for forgot-password and reset-password
- Send password reset email via Resend
- Use existing VerificationToken model for 1-hour reset tokens
- Follow existing auth UI patterns (Card, form style)

## Notes

- Password reset tokens expire in 1 hour (shorter than 24h verification tokens)
- Reset link format: /reset-password?token={uuid}
- Uses same VerificationToken table as email verification
- EMAIL_VERIFICATION toggle does not affect password reset (reset always works)

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

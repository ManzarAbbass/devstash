<!--
# Current Feature

## Status

<!-- Not Started | In Progress | Complete -->

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->
-->

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
- 2026-06-14: Rate Limiting for Auth — Upstash Redis rate limiting on login (5/15min IP+email), register (3/1h IP), forgot-password (3/1h IP), reset-password (5/15min IP), reusable src/lib/rate-limit.ts utility, 429 + Retry-After headers, fail-open, frontend toast/error messages [Completed]
- 2026-06-15: Items List View — Dynamic route /items/[type], type-filtered queries, shared ItemCard component, responsive 2-column grid, type-colored borders, empty state with icon [Completed]
- 2026-06-17: Responsive Items Grid — Changed grid from fixed `sm:grid-cols-2` to `sm:grid-cols-2 xl:grid-cols-3` for responsive 2‑col tablet / 3‑col full‑screen layout [Completed]
- 2026-06-17: Vitest Setup — Installed Vitest, created config with @ alias + V8 coverage + Node env, global Prisma mock, sample tests for utils and verification-token, updated test scripts in package.json, documented testing conventions in coding-standards.md, updated workflow in ai-interaction.md [Completed]
- 2026-06-18: Item Drawer — Right-side Sheet drawer on card click, action bar with favorite/pin/copy/edit/delete, data fetched via /api/items/[id], query function getItemById, skeleton loading state, fixed missing CSS vars (popover/card), added item descriptions to seed, unit tests for getItemById [Completed]
- 2026-06-18: Item Drawer — Edit Mode — Edit button toggles inline edit mode (Save/Cancel), editable title/description/tags + type-specific fields (content, language, URL), Zod validation, server action updateItem, query function with tag disconnect+connect-or-create, toast notifications, router.refresh(), unit tests [Completed]
- 2026-06-18: Item Delete — DB query, server action, ShadCN AlertDialog component, delete button wired with confirmation dialog and toast notification, unit tests [Completed]
- 2026-06-18: Item Create — Modal dialog with Base UI Dialog, type selector cards (snippet, prompt, command, note, link), dynamic type-aware form fields, Zod validation, server action createItem, DB query with tag connect-or-create, toast notifications, router.refresh(), unit tests for query + server action [Completed]
- 2026-06-19: Code Editor — Monaco Editor component with dark custom theme, macOS window dots, copy button, language label, fluid height (max 400px), syntax highlighting for 50+ languages, replaces Textarea for snippets/commands in drawer and create dialog, keeps Textarea for prompts/notes, type-specific add buttons on each type page, item count display, custom appDark Monaco theme [Completed]
- 2026-06-20: File Upload with Supabase — Supabase Storage upload/download API routes, FileUpload component with drag-and-drop/progress/preview, file/image type support in create dialog and ItemDrawer, auto-delete from storage on item delete, bucket auto-creation [Completed]
- 2026-06-21: Quick Wins Cleanup — H3: Password minimum 6→8 (3 server + 3 client files); L3: Suspense fallbacks on 5 auth pages; M2: env guard in resend.ts; M3: env guard in rate-limit.ts; M5: AbortController in ItemDrawer; L1: Extract shared iconMap to src/lib/icons.ts; L2: Extract formatFileSize/extractFileKey to src/lib/utils.ts [Completed]
- 2026-06-21: Internal Refactor — Large File Splits: Extract `formatItem()` utility in `src/lib/db/items.ts`, eliminate 6x duplicated 18-line mapper (−64 lines) [Completed]
- 2026-06-21: Internal Refactor — Large File Splits (Batch 2): Extract 11 components from item-drawer, create-item-dialog, profile-content, register-form, reset-password-form; shared FieldError, StatusCard, utils (−470 lines across 5 files) [Completed]
- 2026-06-22: Collection Create — CreateCollectionDialog with name+description fields, server action with Zod validation, DB query, wired New Collection button in top bar, toast+router.refresh(), 9 unit tests [Completed]
- 2026-06-22: Add Item to Collections — CollectionSelect multi-select component, wired into Create Item dialog and Edit Item drawer, collection association in createItem/updateItem server actions and DB queries, collections API route for edit pre-population, read-only collection badges in drawer view mode [Completed]
- 2026-06-23: Collections Pages — `/collections` and `/collections/[id]` pages, extracted `CollectionCard` from `main-content.tsx` into dedicated component, sidebar "View all collections" link, compact card layout on collection and item-type pages to match dashboard recent items [Completed]

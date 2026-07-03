# Current Feature: Actions Refactor — Extract shared helpers and types

## Status

<!-- Not Started | In Progress | Complete -->

In Progress

## Goals

- [x] Create `src/types/actions.ts` with shared result types (`DataResult`, `FieldResult`, `VoidResult`)
- [x] Create `src/actions/shared.ts` with reusable action helpers (`requireAuth`, `parseFormData`, `validateInput`, `withErrorHandling`, `withVoidHandling`, `withAiGuard`)
- [x] Refactor `src/actions/items.ts` — use shared auth, zod parsing, error handling, and result types
- [x] Refactor `src/actions/collections.ts` — use shared auth, zod parsing, error handling, and result types
- [x] Refactor `src/actions/settings.ts` — use shared auth, input validation, and void error handling
- [x] Refactor `src/actions/ai.ts` — use shared auth, AI guard (access + rate limit), and input validation
- [x] All 25 existing action tests pass
- [x] Zero TypeScript errors in action source files

## Notes

Driven by refactor scanner analysis. 6 duplicate patterns addressed:

| Pattern | Occurrences | Solution |
|---------|-------------|----------|
| Auth/session check | 15× across 4 files | `requireAuth()` in shared.ts |
| Zod field error formatting | 4× in items + collections | `parseFormData()` in shared.ts |
| try/catch error wrapper | ~12× across all files | `withErrorHandling()` / `withVoidHandling()` |
| Zod simple validation | 4× in ai.ts | `validateInput()` in shared.ts |
| Result type definitions | 14× across all files | `DataResult<T>`, `FieldResult<T>`, `VoidResult` in types/actions.ts |
| AI action boilerplate | 4× in ai.ts | `withAiGuard()` in shared.ts |

`withAiGuard` uses dynamic imports to avoid pulling `@/lib/rate-limit` into the module graph of non-AI actions (prevents test env issues).

Files changed:
- **New:** `src/types/actions.ts`, `src/actions/shared.ts`
- **Edited:** `src/actions/items.ts`, `src/actions/collections.ts`, `src/actions/settings.ts`, `src/actions/ai.ts`

## History

- 2026-05-23: Dashboard UI Phase 1 — ShadCN init, layout, dark mode, top bar, placeholders [Completed]
- 2026-05-23: Dashboard UI Phase 2 — Collapsible sidebar with icon collapse, toggle in sidebar, centered search [Completed]
- 2026-05-23: Dashboard UI Phase 2 (redo) — Sidebar redesign: collapsible to icons, toggle inside, Nav heading, centered search [Completed]
- 2026-05-23: Dashboard UI Phase 3 — Main content with stats cards, collections grid, pinned + recent items [Completed]
- 2026-05-25: Prisma + Neon PostgreSQL Setup — Initial setup and schema generation [Completed]
- 2026-05-25: Seed Script — Populate database with sample data for development and demos [Completed]
- 2026-05-25: Dashboard Collections — Replace mock data with real data from the database [Completed]
- 2026-05-25: Dashboard Items — Replace mock data with real data from the database [Completed]
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
- 2026-06-24: Collection Actions — Edit/delete collection on detail page and card dropdown, EditCollectionDialog for meta, card body click navigation, 3-dot dropdown with Edit/Delete/Favorite (UI only) [Completed]
- 2026-06-24: Global Search/Command Palette — cmdk-based command palette with fuzzy search, Cmd+K/Ctrl+K shortcut, grouped results (Items + Collections), keyboard navigation, TopBar search input opens palette, ⌘K hint, pre-fetched search data, 8 unit tests [Completed]
- 2026-06-24: Pagination — Added pagination to /items/[type], /collections/[id], and /collections pages with numbered page links and prev/next controls; created PaginationControls component; seeded 22+ snippets for pagination test data; added sidebar scrolling with hidden scrollbar; DASHBOARD_COLLECTIONS_LIMIT = 6 [Completed]
- 2026-06-25: Settings Page — New /settings route with Change Password + Delete Account, Settings link in sidebar dropdown, removed account actions from profile [Completed]
- 2026-06-25: Editor Preferences Settings — Editor pref card on /settings with font/tab size, word wrap/minimap toggles, theme dropdown; auto-save to editorPreferences JSON column; context provider; applied to Monaco editor across app; 16 unit tests [Completed]
- 2026-06-25: Favorites Page — `/favorites` route with auth protection, compact terminal-style list view, separate sections for items and collections with counts, ItemDrawer on click, collection link navigation, empty state, favorite toggle server actions, star icon in TopBar [Completed]
- 2026-06-27: Favorite Toggle Buttons — Wired toggleItemFavorite/toggleCollectionFavorite server actions to star buttons in ItemDrawerActions, ItemCard (via ItemCardWithDrawer), CollectionCard dropdown, and CollectionDetailHeader [Completed]
- 2026-06-27: Favorites Client-Side Sorting — Added sort by Name / Date / Type to favorites page using Base UI Select, client-side useMemo sorting (no DB changes), matches terminal aesthetic [Completed]
- 2026-06-27: Pinned Items — toggleItemPin server action, Pin button wired in ItemDrawer, optimistic UI + toast, pinned items sort to top of all listings, static Pin indicator on ItemCard [Completed]
- 2026-06-27: Homepage Mockup — Marketing homepage prototype at `/` with hero chaos animation, dashboard preview, features, AI, pricing, CTA, footer sections, responsive hamburger nav [Completed]
- 2026-06-27: Homepage Implementation — Refactored monolithic client-page into server + client component composition (9 components under src/components/homepage/), migrated from homepage.css to Tailwind, blue gradient button theme, matching dashboard D-mark logo, proper routing [Completed]
- 2026-06-27: Responsive Topbar — Hamburger moved to leftmost, search bar becomes icon + opens CommandPalette on mobile, New Item + New Collection merged into single "+" dropdown, logo shows icon-only on mobile (hidden text), removed rigid `w-52` on actions container, `max-md:ml-auto` to keep icons right-aligned [Completed]
- 2026-06-28: Auth Navbar — Added homepage Nav to /sign-in and /register pages, replaced "D" icon with Folder/FolderClosed icon in nav and dashboard header, removed "D" icon from auth card headers [Completed]
- 2026-06-28: Stripe Phase 1 — Core Infrastructure: stripe SDK, env vars, client singleton, isPro in session, usage-limit helpers (50 items / 3 collections free tier), file upload gated to Pro, 11 unit tests [Completed]
- 2026-06-28: Stripe Phase 2 — Integration & UI: API routes (checkout, portal, webhook), feature gating on server actions + upload, settings subscription card with monthly/yearly toggle, PricingCards wired to checkout, sidebar + create dialog gating for file/image types, SessionProvider in root layout [Completed]
- 2026-06-30: Upgrade Flow — New `/upgrade` page with Free vs Pro comparison cards and monthly/yearly toggle, Upgrade ghost button in dashboard header for free users, checkout redirects to Stripe [Completed]
- 2026-07-01: Language Select Dropdown — Replaced free-text language Input with Base UI Select in create item dialog and item drawer edit mode; moved language selector above content editor; shared LANGUAGE_OPTIONS (34 languages); fixed z-index and overflow clipping by removing overflow-hidden from dialog/sheet popups and rendering Positioner inline with z-[60] [Completed]
- 2026-07-01: AI Explain Code — Google Gemini-powered code explanation for snippets and commands in item drawer. Sparkles button, Code/Explain tabs, Pro gating, rate limiting, mock fallback for dev, 7 unit tests [Completed]
- 2026-07-01: AI Explain — Switched to DeepSeek via OpenRouter (free tier). Direct fetch to chat completions API, env var OPENROUTER_API_KEY, removed mock fallback [Completed]
- 2026-07-01: AI Tag Suggestions — suggestTags server action, "Suggest Tags" button with Sparkles icon in create dialog and item drawer edit mode, AI generates 1-5 tags with accept/reject chips, Pro gated and rate limited [Completed]
- 2026-07-01: AI Suggest Description — suggestDescription server action, rate limiter, "Suggest Description" button with Sparkles icon in create dialog and item drawer edit mode, AI generates 1-2 sentence description and fills textarea directly, Pro gated and rate limited, hidden scrollbar on description textarea [Completed]
- 2026-07-01: AI Prompt Optimizer — optimizePrompt server action, Optimize button in MarkdownEditor header for prompt items, Gemini-powered (switched to DeepSeek via OpenRouter), optimized prompt shown with Accept/Reject, Accept auto-saves via updateItem, Pro gated (Crown for free), rate limited 20/min, hidden scrollbar on optimized display [Completed]
- 2026-07-02: UI Review & Register GitHub Button — Playwright audit of all pages, added GitHub OAuth button + "Or continue with" divider to register form, updated subtitle, changed confirm password icon Lock→KeyRound [Completed]
- 2026-07-03: Actions Refactor — Extract shared helpers and types from src/actions/ [In Progress]

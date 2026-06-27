# Current Feature: Homepage Mockup

## Status

In Progress

## Goals

- Create a marketing homepage prototype in `prototypes/homepage/` with `index.html`, `styles.css`, `script.js`
- Hero Section: Chaos Container with 8 floating animated icons, Transform Arrow, Dashboard Preview
- Fixed top nav with logo, Features/Pricing links, Sign In/Get Started buttons
- Hero Text with gradient headline, subheadline, and CTA buttons
- Features grid with 6 cards using item type accent colors
- AI Section with Pro badge, checklist, and code editor mockup
- Pricing section: Free ($0) vs Pro ($8/mo) with yearly toggle ($72/yr)
- CTA section with "Ready to Organize Your Knowledge?" heading
- Footer with logo, link columns, and copyright with current year
- Animations: requestAnimationFrame icon drift, CSS arrow pulse, scroll fade-in, navbar scroll opacity
- Responsive: mobile stacks vertically, arrow rotates 90°, single column grids

## Notes

- Output directory: `prototypes/homepage/`
- Color palette: Snippet `#3b82f6`, Prompt `#f59e0b`, Command `#06b6d4`, Note `#22c55e`, File `#64748b`, Image `#ec4899`, URL `#6366f1`
- Chaos icons: Notion, GitHub, Slack, VS Code, Browser tabs, Terminal, Text file, Bookmark
- Icons float randomly, bounce off walls, rotate/scale pulse, repel from mouse cursor
- Pro card has "Most Popular" badge

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
- 2026-06-24: Collection Actions — Edit/delete collection on detail page and card dropdown, EditCollectionDialog for meta, card body click navigation, 3-dot dropdown with Edit/Delete/Favorite (UI only) [Completed]
- 2026-06-24: Global Search/Command Palette — cmdk-based command palette with fuzzy search, Cmd+K/Ctrl+K shortcut, grouped results (Items + Collections), keyboard navigation, TopBar search input opens palette, ⌘K hint, pre-fetched search data, 8 unit tests [Completed]
- 2026-06-24: Pagination — Added pagination to /items/[type], /collections/[id], and /collections pages with numbered page links and prev/next controls; created PaginationControls component; seeded 22+ snippets for pagination test data; added sidebar scrolling with hidden scrollbar; DASHBOARD_COLLECTIONS_LIMIT = 6 [Completed]
- 2026-06-25: Settings Page — New /settings route with Change Password + Delete Account, Settings link in sidebar dropdown, removed account actions from profile [Completed]
- 2026-06-25: Editor Preferences Settings — Editor pref card on /settings with font/tab size, word wrap/minimap toggles, theme dropdown; auto-save to editorPreferences JSON column; context provider; applied to Monaco editor across app; 16 unit tests [Completed]
- 2026-06-25: Favorites Page — `/favorites` route with auth protection, compact terminal-style list view, separate sections for items and collections with counts, ItemDrawer on click, collection link navigation, empty state, toggle favorite server actions, star icon in TopBar [Completed]
- 2026-06-27: Favorite Toggle Buttons — Wired toggleItemFavorite/toggleCollectionFavorite server actions to star buttons in ItemDrawerActions, ItemCard (via ItemCardWithDrawer), CollectionCard dropdown, and CollectionDetailHeader [Completed]
- 2026-06-27: Favorites Client-Side Sorting — Added sort by Name / Date / Type to favorites page using Base UI Select, client-side useMemo sorting (no DB changes), matches terminal aesthetic [Completed]
- 2026-06-27: Pinned Items — toggleItemPin server action, Pin button wired in ItemDrawer, optimistic UI + toast, pinned items sort to top of all listings, static Pin indicator on ItemCard [Completed]

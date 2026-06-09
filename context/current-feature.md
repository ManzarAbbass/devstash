# Current Feature

Seed favorite collections and items so UI favorites render

## Status

In Progress

## Goals

- Mark "React Patterns" and "Terminal Commands" collections as `isFavorite: true` in the seed script so they appear in the sidebar "Favorites" section and count toward the "Favorite Collections" stat card
- Mark "Custom Hooks" (first snippet) and "Git Operations" (first command) items as `isFavorite: true` so they show a filled star icon and count toward the "Favorite Items" stat card
- Re-run seed and verify favorites render in sidebar and dashboard

## Notes

- The `dashboard-phase-2-spec.md` requires "Favorite collections" as a feature, and the `dashboard-phase-3-spec.md` has favorited items in mock data, but the seed script was never updated to set `isFavorite: true` on any records
- UI code for displaying favorites (sidebar Favorites section, star icons, stat counts) is already implemented via `getSidebarCollections()` and `getCollections()` — only seed data is missing

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
- 2026-06-09: Fix N+1 queries in collection stats and sidebar — Replaced eager-loading N+1 patterns in `getCollections()` and `getSidebarCollections()` with single GROUP BY aggregation queries; added `@@index([collectionId])` on ItemCollection [Completed]

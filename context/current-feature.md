# Current Feature

Fix N+1 queries in collection stats and sidebar

## Status

In Progress

## Goals

- Replace eager-loading N+1 pattern in `getCollections()` with aggregation queries to avoid loading all items per collection just to compute type stats
- Replace eager-loading N+1 pattern in `getSidebarCollections()` with aggregation to compute dominant type color without loading all items
- Return types (`CollectionWithStats`, sidebar collection shape) must remain identical — no UI changes needed
- Verify dashboard renders correctly with no regressions

## Notes

- N+1 issue identified in scan: `src/lib/db/collections.ts:15-73` loads ALL items with full itemType for every collection just to compute `dominantType` and `typeIcons`
- Same pattern in `src/lib/db/items.ts:130-168` loads ALL items per collection just to determine dominant color for the sidebar
- Fix is low-risk — only touches the query layer, return types stay the same, no UI changes
- Can use Prisma `groupBy` or `_count` with filtering instead of eager-loading all related rows

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

# Current Feature

Dashboard Items — Replace dummy item data with real data from the database

## Status

Completed

## Goals

- Create `src/lib/db/items.ts` with data fetching functions
- Fetch items directly in server component
- Item card icon/border derived from the item type
- Display item type tags and everything else currently shown
- If no pinned items, hide the pinned section entirely
- Update collection stats display

## Notes

- Reference the screenshot at `@context/screenshots/dashboard-ui-main.png`
- Layout and design are already in place; just swap mock data for real DB data

## History

- 2026-05-25: Dashboard Items — Replace dummy item data with real data from the database [Completed]
- 2026-05-25: Dashboard Collections — Replace mock data with real data from the database [Completed]
- 2026-05-25: Seed Script — Populate database with sample data for development and demos [Completed]
- 2026-05-25: Seed script — initial data population for development and demos
- 2026-05-25: Prisma + Neon PostgreSQL Setup — Initial setup and schema generation
- 2026-05-23: Dashboard UI Phase 1 — ShadCN init, layout, dark mode, top bar, placeholders
- 2026-05-23: Dashboard UI Phase 3 — Main content with stats cards, collections grid, pinned + recent items
- 2026-05-23: Dashboard UI Phase 2 — Collapsible sidebar with icon collapse, toggle in sidebar, centered search
- 2026-05-23: Dashboard UI Phase 2 (redo) — Sidebar redesign: collapsible to icons, toggle inside, Nav heading, centered search

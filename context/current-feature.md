# Current Feature

Seed Script — Populate database with sample data for development and demos

## Status

In Progress

## Goals

- Create `prisma/seed.ts` with bcryptjs password hashing (12 rounds)
- Seed demo user (john@example.com / 12345678)
- Seed 7 system item types with Lucide icon names
- Seed 5 collections with items across snippets, prompts, commands, and links
- Use real URLs for link-type items (DevOps + Design Resources)

## Notes

- Run with: `npx tsx prisma/seed.ts`
- Use bcryptjs (not bcrypt) to avoid native compilation issues

## History

- 2026-05-25: Seed script — initial data population for development and demos
- 2026-05-25: Prisma + Neon PostgreSQL Setup — Initial setup and schema generation
- 2026-05-23: Dashboard UI Phase 1 — ShadCN init, layout, dark mode, top bar, placeholders
- 2026-05-23: Dashboard UI Phase 3 — Main content with stats cards, collections grid, pinned + recent items
- 2026-05-23: Dashboard UI Phase 2 — Collapsible sidebar with icon collapse, toggle in sidebar, centered search
- 2026-05-23: Dashboard UI Phase 2 (redo) — Sidebar redesign: collapsible to icons, toggle inside, Nav heading, centered search

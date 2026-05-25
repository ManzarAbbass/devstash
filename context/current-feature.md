# Current Feature

Prisma + Neon PostgreSQL Setup

## Status

Completed

## Goals

- Install and configure Prisma 7 with Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Set up development and production database branches
- Always create migrations (never use `db push`)

## Notes

- Prisma 7 has breaking changes — review upgrade guide and docs before installing
- Dev branch uses `DATABASE_URL` in Neon; production branch is separate
- Migration workflow: create in dev first, verify, then apply to prod

## History

- 2026-05-25: Prisma + Neon PostgreSQL Setup — Initial setup and schema generation
- 2026-05-23: Dashboard UI Phase 1 — ShadCN init, layout, dark mode, top bar, placeholders
- 2026-05-23: Dashboard UI Phase 3 — Main content with stats cards, collections grid, pinned + recent items
- 2026-05-23: Dashboard UI Phase 2 — Collapsible sidebar with icon collapse, toggle in sidebar, centered search
- 2026-05-23: Dashboard UI Phase 2 (redo) — Sidebar redesign: collapsible to icons, toggle inside, Nav heading, centered search


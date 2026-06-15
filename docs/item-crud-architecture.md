# Item CRUD Architecture

> Status: **Read layer complete; write layer (create/update/delete) not yet implemented.**
> This document describes the current architecture and the planned design for the full CRUD system.

---

## File Structure (Planned)

```
src/
├── actions/
│   └── items.ts                  ← All mutations (create, update, delete)
├── app/
│   └── items/
│       └── [type]/
│           ├── page.tsx          ← List items of one type
│           └── [id]/
│               └── page.tsx      ← Item detail (or redirect to drawer)
├── components/
│   ├── dashboard/
│   │   ├── dashboard-layout.tsx  ← "New Item" button (placeholder)
│   │   ├── main-content.tsx      ← Displays pinned/recent items + collections
│   │   └── sidebar.tsx           ← Nav links to /items/{type}s
│   └── items/
│       ├── item-drawer.tsx       ← Detail drawer (slides in from right)
│       ├── item-form.tsx         ← Create/edit form, adapts by type
│       ├── item-card.tsx         ← Card display for grid/list (future)
│       └── type-editors/         ← Type-specific content editors
│           ├── text-editor.tsx   ← snippet, prompt, command, note
│           ├── url-editor.tsx    ← link
│           └── file-uploader.tsx ← file, image (Pro)
├── lib/
│   ├── db/
│   │   ├── items.ts             ← Read-only queries (existing)
│   │   └── collections.ts       ← Read-only queries (existing)
│   └── constants.ts             ← Missing; should centralize type metadata
```

---

## Current State (Read Layer)

### Data Fetching: `src/lib/db/items.ts`

Pure async functions called directly from server components. No React hooks, no API routes.

| Function | Returns | Used By |
|----------|---------|---------|
| `getPinnedItems(userId)` | Pinned items with type + tags | `main-content.tsx` |
| `getRecentItems(userId)` | Last 10 items | `main-content.tsx` |
| `getItemStats(userId)` | Total items + favorite counts | `main-content.tsx` |
| `getItemTypeCounts(userId)` | Per-type counts (canonical order) | `sidebar.tsx` |
| `getSidebarData(userId)` | User info + types + collections | `dashboard/page.tsx` |

Pattern — all queries:
```ts
import { prisma } from "@/lib/prisma"
export async function getXxx(userId: string) { ... }
```

### Display: Server + Client Components

- **`dashboard/page.tsx`** — Server component; authenticates, fetches sidebar data, passes to layout
- **`main-content.tsx`** — Server component; fetches collections + items + stats in parallel, renders cards
- **`sidebar.tsx`** — Client component; receives data as prop, renders type nav links + collections

### Routing (Sidebar Links)

Sidebar links point to `/items/{type.name}s` (e.g., `/items/snippets`, `/items/commands`, `/items/links`).
Item rows link to `/items/{item.itemType.name}/{item.id}` — **no routes exist yet**.

---

## Planned Write Layer (Mutations)

### Single Action File: `src/actions/items.ts`

All mutations in one file following the project convention (`context/coding-standards.md`):

```ts
"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createItem(data: CreateItemInput): Promise<ActionResult<Item>>
export async function updateItem(id: string, data: UpdateItemInput): Promise<ActionResult<Item>>
export async function deleteItem(id: string): Promise<ActionResult<void>>
export async function toggleFavorite(id: string): Promise<ActionResult<Item>>
export async function togglePin(id: string): Promise<ActionResult<Item>>
```

**Return pattern**: `{ success: boolean, data?: T, error?: string }`

**Key considerations**:
- `contentType` is derived from `itemTypeId` (not user-supplied)
- `language` only applies to `snippet` and `command` types
- `fileUrl` / `fileName` / `fileSize` only for `file` and `image` types
- `url` only for `link` type
- Files/Images: upload to Cloudflare R2 first, then store URL — Pro check before upload
- `revalidatePath("/items")` after mutations

---

## Routing: `/items/[type]`

### List Route: `src/app/items/[type]/page.tsx`

- Dynamic segment `[type]` matches `snippets`, `prompts`, `commands`, `notes`, `files`, `images`, `links`
- Server component that fetches items by type for the current user
- Plural form for display, singular for query (strip trailing `s`)
- Renders a grid/list of `ItemCard` components

### Detail Route: `src/app/items/[type]/[id]/page.tsx`

- Used for direct links or shared URLs
- In-app navigation uses the **drawer** instead (see below)

---

## Type-Specific Logic: Components, Not Actions

The core design principle: **actions are type-agnostic**. All type-specific behavior lives in components.

| Concern | Where | Why |
|---------|-------|-----|
| Which fields to show in the form | `item-form.tsx` (switches on `itemType.name`) | Form knows the type |
| Content editor (code editor, plain text, URL input, file upload) | `type-editors/*` components | Each type renders differently |
| Validation rules (url required for link, file required for file/image) | `item-form.tsx` | Validation is UI concern |
| Pro badge + gate on file/image | `sidebar.tsx` + `item-form.tsx` | Gating is UI concern |
| Icon + color mapping | `sidebar.tsx` (iconMap) + shared constant | Visual, not data |

The action file accepts a generic shape:

```ts
interface CreateItemInput {
  title: string
  description?: string
  content?: string          // text types
  url?: string              // link type
  language?: string         // snippet, command
  itemTypeId: string
  tagIds?: string[]
  collectionIds?: string[]
}

// File/image handled via separate upload step → fileUrl passed in
```

---

## Component Responsibilities

| Component | Type | Role |
|-----------|------|------|
| `dashboard-layout.tsx` | Client | Renders "New Item" button (opens drawer/form) |
| `item-form.tsx` | Client | Create/edit form; adapts fields by type; calls server actions |
| `item-drawer.tsx` | Client | Detail view (favorite, pin, copy, edit, delete actions); ~500px, slides from right |
| `item-card.tsx` | Client | Card in list/grid views; color-coded border, type icon, title, tags |
| `sidebar.tsx` | Client | Type nav links to `/items/{type}s` with counts + PRO badges |
| `main-content.tsx` | Server | Renders pinned/recent items using `ItemRow` (inline component) |

### Drawer Actions (from `context/devstashui/devstash-drawer-context.md`)

Header: type icon, title, tags, close button

Action bar: Favorite, Pin, Copy (content), Edit (opens form in drawer), Delete (with confirmation)

Content: Description → Content (code block / URL / file preview) → Tags → Collections → Details (created/updated)

---

## Type Metadata (Missing Constant)

Currently, icon→component mapping is duplicated in 3 places (`sidebar.tsx`, `main-content.tsx`, `profile-content.tsx`). A `src/lib/constants.tsx` should centralize:

```ts
export const ITEM_TYPE_CONFIG = {
  snippet: { icon: Code2, color: "#3b82f6", contentType: "text" as const },
  prompt:  { icon: Sparkles, color: "#8b5cf6", contentType: "text" as const },
  command: { icon: Terminal, color: "#f97316", contentType: "text" as const },
  note:    { icon: StickyNote, color: "#fde047", contentType: "text" as const },
  file:    { icon: File, color: "#6b7280", contentType: "file" as const, pro: true },
  image:   { icon: Image, color: "#ec4899", contentType: "file" as const, pro: true },
  link:    { icon: Link2, color: "#10b981", contentType: "url" as const },
} as const
```

---

## Gaps Summary

| Piece | File | Status |
|-------|------|--------|
| Server actions (create/update/delete) | `src/actions/items.ts` | ❌ Missing |
| Item list route | `src/app/items/[type]/page.tsx` | ❌ Missing |
| Item detail route | `src/app/items/[type]/[id]/page.tsx` | ❌ Missing |
| Item detail drawer | `src/components/items/item-drawer.tsx` | ❌ Missing |
| Item create/edit form | `src/components/items/item-form.tsx` | ❌ Missing |
| Type-specific editors | `src/components/items/type-editors/` | ❌ Missing |
| Item card component | `src/components/items/item-card.tsx` | ❌ Missing |
| Centralized constants | `src/lib/constants.tsx` | ❌ Missing |
| "New Item" wired up | `dashboard-layout.tsx` | ❌ Placeholder |
| File upload to R2 | `src/lib/upload.ts` | ❌ Missing |

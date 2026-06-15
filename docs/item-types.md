# Item Types

DevStash has 7 system item types, each with a unique icon, color, and purpose. They are seeded in `prisma/seed.ts` and rendered in the sidebar via `src/components/dashboard/sidebar.tsx`.

## Per-Type Reference

| # | Type | Icon | Color | Hex | Content Type | Pro? | Key Fields | Purpose |
|---|------|------|-------|-----|--------------|------|------------|---------|
| 1 | `snippet` | `Code` (lucide `Code2`) | Blue | `#3b82f6` | `text` | No | `content`, `language` | Store reusable code blocks |
| 2 | `prompt` | `Sparkles` | Purple | `#8b5cf6` | `text` | No | `content` | Save AI prompts and system messages |
| 3 | `command` | `Terminal` | Orange | `#f97316` | `text` | No | `content` | Document CLI / shell commands |
| 4 | `note` | `StickyNote` | Yellow | `#fde047` | `text` | No | `content` | General notes and documentation |
| 5 | `file` | `File` | Gray | `#6b7280` | `file` | **Yes** | `fileUrl`, `fileName`, `fileSize` | Upload and reference files |
| 6 | `image` | `Image` | Pink | `#ec4899` | `file` | **Yes** | `fileUrl`, `fileName`, `fileSize` | Upload and preview images |
| 7 | `link` | `Link` (lucide `Link2`) | Emerald | `#10b981` | `url` | No | `url` | Bookmark useful URLs |

## Content-Type Classification

Every item has a `contentType` field on the `Item` model (`prisma/schema.prisma:86`):

| Category | Types | Storage | Display |
|----------|-------|---------|---------|
| **text** | snippet, prompt, command, note | `content` column (markdown string) | Rendered inline with syntax highlighting when `language` is set (snippet, command) |
| **file** | file, image | Cloudflare R2; metadata in `fileUrl`, `fileName`, `fileSize` | File icon / image preview; **Pro-only** |
| **url** | link | `url` column | External-link indicator, clickable URL, PRO badge not shown |

## Shared Properties (all types)

Defined on the `Item` model (`prisma/schema.prisma:83-112`):

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (cuid) | Auto-generated |
| `title` | `String` | Displayed as card/link label |
| `description` | `String?` | Optional subtitle |
| `isFavorite` | `Boolean` | Default `false` |
| `isPinned` | `Boolean` | Default `false` |
| `createdAt` | `DateTime` | Auto-set |
| `updatedAt` | `DateTime` | Auto-updated |
| `userId` | `String` | FK to User |
| `itemTypeId` | `String` | FK to ItemType |
| `tags` | `TagsOnItems[]` | M2M via join table |
| `collections` | `ItemCollection[]` | M2M via join table |

## Display Differences

| Aspect | text types | file / image types | link types |
|--------|-----------|-------------------|------------|
| Sidebar label | `{name}s` (e.g. "Snippets") | `{name}s` + **PRO** badge | `Links` |
| Color | Icon + accent color | Icon + accent color | Icon + accent color |
| Content | Rendered markdown | File thumbnail / icon | URL with external link icon |
| `language` field | Used for syntax highlighting | N/A | N/A |
| Free tier | All available | Blocked (Pro only) | Available |

## ItemType Model

The `ItemType` model (`prisma/schema.prisma:70-81`) stores name, icon, color, and `isSystem` flag. System types have `userId = null`; custom types (future Pro feature) will be linked to a user.

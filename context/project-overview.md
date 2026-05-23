# DevStash — Project Overview

> A fast, searchable, AI-enhanced hub for dev knowledge and resources.  
> Stack: Next.js 16 · React 19 · TypeScript · Prisma 7 · Neon PostgreSQL · Tailwind v4 · ShadCN UI

---

## Problem

Developer knowledge is scattered across:

| Where | What lives there |
|---|---|
| VS Code / Notion | Code snippets |
| AI chat history | Prompts & system messages |
| Project folders | Context files |
| Browser bookmarks | Useful links |
| Random folders | Docs |
| `.txt` files | Commands |
| GitHub Gists | Project templates |
| Bash history | Terminal commands |

DevStash consolidates all of this into one searchable, organized workspace.

---

## Target Users

| User | Core Need |
|---|---|
| Everyday Developer | Fast access to snippets, prompts, commands, links |
| AI-first Developer | Saves prompts, contexts, workflows, system messages |
| Content Creator / Educator | Stores code blocks, explanations, course notes |
| Full-stack Builder | Collects patterns, boilerplates, API examples |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 / React 19 (SSR + API routes, monorepo) |
| Language | TypeScript |
| Database | Neon PostgreSQL |
| ORM | Prisma 7 |
| Caching | Redis *(TBD)* |
| File Storage | Cloudflare R2 |
| Auth | NextAuth v5 (Email/password + GitHub OAuth) |
| AI | OpenAI `gpt-4o-mini` |
| CSS | Tailwind v4 + ShadCN UI |

> ⚠️ **DB rule:** Never use `db push`. Always create and run migrations — in dev first, then prod.

---

## Monetization

### Free
- 50 items total
- 3 collections
- All system item types **except** file and image
- Basic search
- No AI features

### Pro — $8/month or $72/year
- Unlimited items and collections
- File & image uploads
- Custom item types *(coming later)*
- All AI features
- Export data (JSON / ZIP)
- Priority support

> 🔧 **During development:** all users have Pro access.

---

## Features

### A. Item Types

Items have a `contentType` of `text`, `url`, or `file`.

| Type | Color | Icon | Notes |
|---|---|---|---|
| `snippet` | `#3b82f6` blue | `Code` | |
| `prompt` | `#8b5cf6` purple | `Sparkles` | |
| `command` | `#f97316` orange | `Terminal` | |
| `note` | `#fde047` yellow | `StickyNote` | |
| `file` | `#6b7280` gray | `File` | Pro only |
| `image` | `#ec4899` pink | `Image` | Pro only |
| `link` | `#10b981` emerald | `Link` | |

- System types cannot be modified
- Users can create custom types *(Pro, coming later)*
- URL pattern: `/items/snippets`, `/items/prompts`, etc.
- Items are created/accessed via a **quick-access drawer**

### B. Collections

- Group items of any type
- Items can belong to **multiple collections**
- Examples: `React Patterns`, `Context Files`, `Python Snippets`, `Interview Prep`

### C. Search

Full-text search across:
- Title
- Content
- Tags
- Type

### D. Authentication

- Email + password
- GitHub OAuth (via NextAuth v5)

### E. Core Features

- Favorites on items and collections
- Pin items to top
- Recently used list
- Import code from a file
- Markdown editor for text item types
- File upload for `file` / `image` types
- Export data as JSON or ZIP
- Dark mode by default, light mode optional
- Add/remove items to/from multiple collections
- View which collections an item belongs to

### F. AI Features *(Pro only)*

- Auto-tag suggestions
- Item summaries
- Explain This Code
- Prompt optimizer

---

## Data Models

### User
```prisma
model User {
  id                   String   @id @default(cuid())
  // ...NextAuth fields (name, email, image, etc.)
  isPro                Boolean  @default(false)
  stripeCustomerId     String?
  stripeSubscriptionId String?

  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]
}
```

### ItemType
```prisma
model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)

  userId String?
  user   User?   @relation(fields: [userId], references: [id])
  // userId is null for system types

  items Item[]
}
```

### Item
```prisma
model Item {
  id          String   @id @default(cuid())
  title       String
  contentType String   // "text" | "file"
  content     String?  // null if file
  fileUrl     String?  // Cloudflare R2 URL; null if text
  fileName    String?
  fileSize    Int?     // bytes
  url         String?  // for link types
  description String?
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  language    String?  // for code snippets
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id])
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        TagsOnItems[]
  collections ItemCollection[]
}
```

### Collection
```prisma
model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id])

  items ItemCollection[]
}
```

### ItemCollection *(join table)*
```prisma
model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id])
  collection Collection @relation(fields: [collectionId], references: [id])

  @@id([itemId, collectionId])
}
```

### Tag & TagsOnItems
```prisma
model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@id([itemId, tagId])
}
```

---

## UI / UX

### Layout

```
┌─────────────────────────────────────────────┐
│  Sidebar (collapsible)   │  Main Content     │
│                          │                   │
│  Item Types              │  Collections      │
│  • Snippets              │  [card] [card]    │
│  • Commands              │                   │
│  • Prompts               │  Items            │
│  • Notes                 │  [card] [card]    │
│  • Links                 │  [card] [card]    │
│                          │                   │
│  Collections             │                   │
│  • React Patterns        │                   │
│  • Context Files         │                   │
└─────────────────────────────────────────────┘
```

- **Sidebar:** item type links + latest collections; collapses to drawer on mobile
- **Main:** color-coded collection cards (background color = dominant item type); items shown as color-coded border cards
- **Items:** open in a quick-access drawer
- Syntax highlighting for code blocks

### Design Principles

- Dark mode default; light mode available
- Reference aesthetics: Notion, Linear, Raycast
- Clean typography, generous whitespace, subtle borders/shadows
- Desktop-first; mobile-usable

## Reference UI 

Refer to the files below as a base for the dashboard UI. It doesn't have to be exact. Use it as a reference:

- @context/devstashui/devstash-dashboard-context.md
- @context/devstashui/devstash-drawer-context.md

### Micro-interactions

- Smooth transitions
- Hover states on cards
- Toast notifications for actions
- Loading skeletons

---

## Open Questions / Deferred Decisions

- [ ] Redis caching — is it needed at launch?
- [ ] Custom item types — Pro feature, deferred
- [ ] Export format detail (ZIP structure?)
- [ ] AI model confirmed as `gpt-4o-mini`? *(spec says `gpt-5-nano` — verify)*
- [ ] Next.js 16 — not yet released at time of writing; confirm version

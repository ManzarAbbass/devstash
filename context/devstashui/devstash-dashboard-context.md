# DevStash — Dashboard Screen Context

## App Identity
- **Name**: DevStash
- **Tagline**: "Your developer knowledge hub"
- **Purpose**: A personal knowledge management tool for developers to store, organize, and retrieve code snippets, prompts, commands, notes, files, images, and links.

---

## Layout Structure

### Sidebar (Left Panel — fixed, ~250px wide)
- **Top**: App logo + name ("DevStash") with a purple gradient icon
- **Search**: Global search bar with keyboard shortcut (`⌘K`)
- **Types Section** (collapsible, labeled "Types ▾"):
  - Snippets — 24
  - Prompts — 18
  - Commands — 15
  - Notes — 12
  - Files — 5
  - Images — 3
  - Links — 8
- **Collections Section** (collapsible, labeled "Collections ▾"):
  - **Favorites** subsection:
    - React Patterns ⭐
    - Context Files ⭐
    - Git Commands ⭐
  - **All Collections** subsection:
    - Python Snippets — 8
    - Interview Prep — 24
    - AI Prompts — 18
- **Bottom**: User profile row — avatar, name ("John Doe"), email ("john@example.com"), settings gear icon

### Top Bar (Header)
- Left: Sidebar toggle button (panel icon)
- Center: Search bar ("Search items..." placeholder, `⌘K` shortcut)
- Right: "New Collection" button (outlined) + "+ New Item" button (filled/primary)

### Main Content Area
#### Section 1: Collections (grid, 3 columns)
Each collection card contains:
- Collection name (bold)
- Item count (e.g., "12 items")
- Short description
- Type indicator icons (code `</>`, file, link, etc.)
- Colored left border accent (each collection has a unique color: blue, yellow, orange, purple, etc.)
- Star icon if favorited
- `...` overflow menu on hover

Collections shown:
| Name | Items | Description | Favorited |
|---|---|---|---|
| React Patterns | 12 | Common React patterns and hooks | ✅ |
| Python Snippets | 8 | Useful Python code snippets | ❌ |
| Context Files | 5 | AI context files for projects | ✅ |
| Interview Prep | 24 | Technical interview preparation | ❌ |
| Git Commands | 15 | Frequently used git commands | ✅ |
| AI Prompts | 18 | Curated AI prompts for coding | ❌ |

#### Section 2: Pinned Items (list)
Each pinned item row contains:
- Type icon (colored, e.g., blue `</>` for snippet)
- Item name + pin icon 📌 + star icon ⭐ (if favorited)
- Short description
- Tags (pill-style, e.g., `react`, `auth`, `hooks`)
- Date (right-aligned, e.g., "Jan 15")
- Left colored border accent

Items visible:
1. **useAuth Hook** — "Custom authentication hook for React applications" — Tags: react, auth, hooks — Jan 15
2. **API Error Handling Pattern** — "Fetch wrapper with exponential backoff retry logic" — Jan 12

---

## Visual Design
- **Theme**: Dark mode only
- **Background**: Near-black (`#0d0d0d` / `#111`)
- **Sidebar background**: Slightly lighter dark (`#161616`)
- **Card background**: Dark with subtle border (`#1a1a1a`)
- **Accent colors**: Each collection has a unique left-border color (blue, yellow, orange, red, purple, etc.)
- **Primary action button**: White fill, dark text
- **Typography**: Clean sans-serif, white primary text, gray secondary text
- **Icons**: Colored per type (blue for code, yellow for notes, etc.)

---

## Interaction Behaviors
- Clicking a collection card → navigates into that collection view
- Clicking a pinned item row → opens the detail drawer (right panel)
- Hovering a collection card → shows `...` menu
- Sidebar items are clickable filters
- "View all" link on Collections section header
- `⌘K` opens global search

# DevStash — Item Detail Drawer Context

## Overview
The detail drawer slides in from the right side when a user clicks on any item (e.g., a pinned item, a collection item). It overlays the main dashboard without fully replacing it — the dashboard remains partially visible and dimmed on the left.

---

## Drawer Layout

### Header
- **Left**: Type icon (blue `</>` for snippet) + Item title ("useAuth Hook")
- **Below title**: Tag pills showing item type and language — e.g., `Snippets`, `typescript`
- **Right**: Close button (`✕`)

### Action Bar (below header)
A horizontal row of action buttons:
| Button | Icon | Function |
|---|---|---|
| Favorite | ⭐ | Toggle favorite status |
| Pin | 📌 | Toggle pin to dashboard |
| Copy | 📋 | Copy content to clipboard |
| Edit | ✏️ | Open edit mode |
| Delete | 🗑️ (red) | Delete item (destructive) |

---

## Content Sections

### Description
- Label: "Description"
- Value: Plain text — e.g., "Custom authentication hook for React applications"

### Content (Code Block)
- Label: "Content"
- Rendered as a syntax-highlighted code block
- Dark background (`#0d1117` / GitHub dark style)
- Line numbers on the left
- Monospace font
- Example content shown (useAuth hook):
```
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthP...')
  }
  return context
}
```
*(line 7 is truncated in view — full content available on copy/edit)*

### Tags
- Label: "Tags"
- Displayed as pill/badge components
- Example: `react`, `auth`, `hooks`

### Collections
- Label: "Collections"
- Shows which collection(s) this item belongs to
- Displayed as a pill/badge
- Example: `React Patterns`

### Details
- Label: "Details"
- Two rows:
  - **Created**: January 15, 2024
  - **Updated**: January 15, 2024

---

## Visual Design
- **Drawer width**: ~500px, slides in from right
- **Background**: Dark (`#161616`), consistent with sidebar
- **Overlay**: Main content dims slightly behind drawer
- **Code block**: Darker inset background with subtle border
- **Action icons**: Muted gray, except delete which is red
- **Tag/badge pills**: Dark gray background, light text, rounded
- **Section labels**: Small, muted gray uppercase-style text
- **Dividers**: Subtle between sections

---

## Interaction Behaviors
- Clicking `✕` closes the drawer, dashboard returns to full view
- "Copy" copies raw content to clipboard (not the entire item, just the code/text)
- "Edit" switches drawer into edit mode (fields become editable)
- "Delete" shows a confirmation before deleting
- "Favorite" and "Pin" toggle instantly with visual feedback
- Drawer is scrollable if content is long
- Clicking outside the drawer (on dimmed dashboard) closes it

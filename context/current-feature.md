# Current Feature

Responsive Topbar — declutter dashboard header on mobile

## Status

In Progress

## Goals

- Make the topbar comfortable on screens as narrow as 375px
- No functionality loss — all actions remain accessible
- Minimal diff: change classes only, no structural rework

## Notes

### Changes made:

1. **Hamburger moved to far left** — sidebar trigger now sits left of the logo on mobile
2. **Search bar → icon on mobile** — full search input is `hidden md:block`, replaced by a search icon button that opens the CommandPalette
3. **Two "+" buttons merged into one** — mobile shows a single `+` icon that opens a DropdownMenu with "New Collection" (FolderPlus) and "New Item" (FilePlus)
4. **Logo**: `w-40` → `md:w-40`, "DevStash" text `hidden md:inline`
5. **Actions container**: removed rigid `w-52`

### Mobile layout at 375px:
```
[☰] [D] [🔍] ...flex... [★] [+]
```

# Homepage Implementation Spec

## Overview

Refactor `src/app/page.tsx` from a single monolithic `"use client"` component into a composition of focused server and client components, replacing the custom `homepage.css` with Tailwind utility classes and ShadCN components.

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Server component — composes all sections
│   └── homepage.css          # DELETE — migrate styles to Tailwind
└── components/
    └── homepage/
        ├── Nav.tsx            # Client — scroll effects, mobile menu toggle
        ├── HeroSection.tsx    # Server — hero text + CTA buttons
        ├── ChaosAnimation.tsx # Client — requestAnimationFrame, mouse repel
        ├── DashboardPreview.tsx # Server — static dashboard mockup
        ├── FeaturesSection.tsx # Server — features grid
        ├── AiSection.tsx      # Server — AI content + editor mockup
        ├── PricingCards.tsx   # Client — billing toggle state
        └── Footer.tsx         # Server — footer links, brand, copyright
```

## Component Breakdown

### `src/app/page.tsx` (Server)

Compose all sections in order. No `"use client"`, no `useEffect`, no `homepage.css` import.

```tsx
import { Nav } from "@/components/homepage/Nav"
import { HeroSection } from "@/components/homepage/HeroSection"
import { FeaturesSection } from "@/components/homepage/FeaturesSection"
import { AiSection } from "@/components/homepage/AiSection"
import { PricingCards } from "@/components/homepage/PricingCards"
import { Footer } from "@/components/homepage/Footer"
import { ScrollReveal } from "@/components/homepage/ScrollReveal"

export default function HomePage() {
  return (
    <div className="bg-[#0f0f11] text-[#f4f4f5] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection />
      <FeaturesSection />
      <AiSection />
      <PricingCards />
      <Footer />
    </div>
  )
}
```

### `Nav.tsx` (Client)

- Fixed top nav with `backdrop-filter: blur(12px)` via Tailwind
- Logo (SVG inline or lucide icon), "Features" / "Pricing" anchor links
- "Sign In" → `/sign-in`, "Get Started" → `/register`
- Scroll listener adds `border-b border-[#27272a]` after 50px
- Mobile hamburger menu (useState for open/close)
- On mobile (<768px), hide nav links + actions, show hamburger

### `HeroSection.tsx` (Server)

- Heading with gradient text using Tailwind `bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent`
- Subheadline paragraph
- Two CTA buttons: "Get Started Free" (primary) → `/register`, "See Features" → `#features`
- Below: `ChaosAnimation` + `DashboardPreview` with a transform arrow between them

### `ChaosAnimation.tsx` (Client)

- Port the existing requestAnimationFrame logic from current `page.tsx`
- 8 icons (Notion, GitHub, Slack, VS Code, Browser, Terminal, File, Bookmark) as inline SVGs
- Icons float, bounce off walls, repel from mouse cursor, rotate/scale pulse
- Container: `380×380` card with `bg-[#1f1f23] border border-[#27272a] rounded-xl p-5`
- Label "Your knowledge today…" in uppercase text-xs

### `DashboardPreview.tsx` (Server)

- Static mockup dashboard card (`380×380`)
- Top bar with search bar placeholder + avatar dot
- Sidebar with 7 item type icons (colored letters)
- 2×4 grid of item cards with colored top borders using the type colors from the mockup

### `FeaturesSection.tsx` (Server)

- 6 feature cards in responsive grid (3-col desktop, 2-col tablet, 1-col mobile)
- Each card: accent-colored icon circle, title, description
- Data array mapped to cards — keep the data inline in the component

### `AiSection.tsx` (Server)

- Two-column layout (stacks on mobile)
- Left: "Pro Feature" badge (use `<Badge>` from ShadCN or a custom amber gradient), heading "AI-Powered Organization", checklist of 4 items with check marks
- Right: editor mockup with window dots, filename `app.tsx`, syntax-highlighted code lines, "AI Generated Tags" bar with colored tag pills

### `PricingCards.tsx` (Client)

- Monthly/Yearly toggle switch (use `<Switch>` from ShadCN or styled checkbox)
- Free card: $0/mo (always), 50 items, 3 collections, basic search, AI (✗), unlimited (✗)
- Pro card: $8/mo monthly / $6/mo yearly, "Most Popular" badge, unlimited items/collections, AI, file uploads, priority support
- Both cards link to `/register`
- Toggle switches `amount` text between monthly/yearly prices

### `Footer.tsx` (Server)

- Brand logo + "DevStash" + description
- 3 link columns: Product (Features → `#features`, Pricing → `#pricing`, Changelog → `#`), Resources (Docs → `#`, API → `#`, Blog → `#`), Company (About → `#`, Privacy → `#`, Terms → `#`)
- Bottom bar: `© {new Date().getFullYear()} DevStash. All rights reserved.`

## Shared Patterns

### Scroll Reveal

Create a `ScrollReveal.tsx` client component wrapping sections in an `IntersectionObserver` that adds `opacity-100 translate-y-0` when visible. Use on feature cards, price cards, and CTA. Initial state: `opacity-0 translate-y-8 transition-all duration-500`.

### Styling Rules

- No `homepage.css` — all styles via Tailwind utility classes
- Use `cn()` from `@/lib/utils` for conditional classes
- CSS variables from `globals.css` for theme colors (`bg-card`, `border`, `text-secondary`, etc.)
- Use `bg-[#0f0f11]` etc. only for colors not in the theme
- `<Button variant="default">` for primary, `<Button variant="outline">` for outline, `<Button variant="ghost">` for ghost
- Use `lucide-react` icons where applicable (Menu, X, Check, ArrowRight)

### Button / Link Routing

| Label | Route |
|---|---|
| Sign In | `/sign-in` |
| Get Started / Get Started Free | `/register` |
| Upgrade to Pro | `/register` |
| Features (nav) | `#features` |
| Pricing (nav) | `#pricing` |
| See Features (hero CTA) | `#features` |
| Changelog | `#` (placeholder) |
| Documentation | `#` (placeholder) |
| API | `#` (placeholder) |
| Blog | `#` (placeholder) |
| About | `#` (placeholder) |
| Privacy | `#` (placeholder) |
| Terms | `#` (placeholder) |

### Pricing Data

| Feature | Free | Pro |
|---|---|---|
| Price (monthly) | $0 | $8 |
| Price (yearly) | $0 | $6 |
| Items | 50 | Unlimited |
| Collections | 3 | Unlimited |
| Search | Basic | AI-powered |
| AI features | ✗ | ✓ |
| File uploads | ✗ | ✓ |
| Storage | — | Unlimited |
| Support | — | Priority |

## Acceptance Criteria

1. All sections from the prototype render correctly: Nav, Hero, Features, AI, Pricing, CTA, Footer
2. Chaos icons animate, bounce off walls, and repel from mouse cursor
3. Pricing toggle switches between monthly/yearly amounts
4. Mobile menu opens/closes on hamburger click
5. Scroll reveal fades in feature cards, price cards, and CTA section
6. Navbar gets opaque border on scroll
7. All buttons and links navigate to the correct routes listed above
8. No `homepage.css` file remains — all styling uses Tailwind + `cn()`
9. Responsive breakpoints match previous behavior (3→2→1 col grids, hero visual stacks vertically on mobile, arrow rotates 90°)
10. No `"use client"` leaks into server components — only Nav, ChaosAnimation, PricingCards, and ScrollReveal are client components

# Stripe Integration — Phase 2: Integration & UI

## Overview

Build the Stripe API routes (checkout, billing portal, webhook), add feature gating to server actions and API routes, and wire up the UI components (settings subscription card, PricingCards, sidebar gating). Testing requires the Stripe CLI for webhook forwarding.

## Requirements

### API Routes

- `POST /api/stripe/checkout` — creates Stripe Checkout Session; creates a Stripe customer on first purchase and persists `stripeCustomerId`; validates price ID against env constants; returns `{ url }` or error
- `POST /api/stripe/portal` — creates Stripe Billing Portal session; requires existing `stripeCustomerId`; returns `{ url }` or error
- `POST /api/stripe/webhook` — verifies signature with `STRIPE_WEBHOOK_SECRET` using `request.text()` + `stripe.webhooks.constructEvent`; handles `checkout.session.completed` (set `isPro=true`, `stripeSubscriptionId`), `customer.subscription.updated` (sync status), `customer.subscription.deleted` (set `isPro=false`); returns `{ received: true }` or error

### Feature Gating

- Add `checkItemLimit` and `checkFileUploadAllowed` gating to `createItem` server action in `src/actions/items.ts`
- Add `checkCollectionLimit` gating to `createCollection` server action in `src/actions/collections.ts`
- Add `checkFileUploadAllowed` gating to upload API route in `src/app/api/upload/route.ts` (returns 403 on failure)
- All gating applies server-side; UI gating is cosmetic only

### UI Components

- **Settings page** (`src/app/settings/`):
  - Pass `isPro` through `UserProfile` interface and `getUserProfile` query
  - Add subscription card between editor preferences and change password sections
  - Show "Free Plan" or "DevStash Pro" with appropriate description
  - "Upgrade to Pro" button calls `/api/stripe/checkout`
  - "Manage Subscription" button calls `/api/stripe/portal`
- **PricingCards** (`src/components/homepage/PricingCards.tsx`):
  - Wire Pro card CTA to call `/api/stripe/checkout` (authenticated) or redirect to `/sign-in` (unauthenticated)
  - Wire Free card CTA to `/register` (unauthenticated) or `/dashboard` (authenticated)
- **Sidebar** (`src/components/dashboard/sidebar.tsx`):
  - Use `useSession()` to gate file/image type links behind `isPro`
- **Create Item Dialog**:
  - Hide file/image type options for non-Pro users

### Testing with Stripe CLI

- Run `stripe listen --forward-to localhost:3000/api/stripe/webhook` for local webhook testing
- Test checkout with Stripe test card `4242 4242 4242 4242`
- Verify webhook events fire and update DB (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- Verify session picks up `isPro` after page reload (JWT callback syncs on every validation)
- Test error states: expired webhook signature (400), unauthenticated checkout (401), invalid price ID (400), no subscription for portal (400), Stripe API errors (500)

## Dependencies

- Phase 1 (Stripe client, NextAuth types, constants, pro helpers) must be complete
- Stripe Dashboard products/prices created (monthly $8, yearly $72) and price IDs in `.env`
- Stripe CLI installed and configured

# Stripe Subscription Integration Plan

## Overview

Integrate Stripe subscriptions to monetize DevStash Pro ($8/mo monthly, $72/yr annual).

---

## 1. Current State Analysis

### 1.1 Schema — User Model (`prisma/schema.prisma:10-30`)

```prisma
model User {
  id                   String   @id @default(cuid())
  isPro                Boolean  @default(false)
  stripeCustomerId     String?
  stripeSubscriptionId String?
  // ... other fields
}
```

The `isPro`, `stripeCustomerId`, and `stripeSubscriptionId` fields already exist but are never populated programmatically.

### 1.2 NextAuth Configuration (`src/auth.ts`)

- Session strategy: `"jwt"`
- **No `jwt` callback defined** — `isPro` is never synced to the token
- `session` callback injects only `token.sub` into `session.user.id`
- Session type (`src/types/next-auth.d.ts`) does not include `isPro`

### 1.3 Pricing UI (`src/components/homepage/PricingCards.tsx`)

- Landing page has Free/Pro cards with pricing toggles
- **CTA buttons link to `/register`** — no actual payment flow
- Pro features listed: unlimited items/collections, AI, file uploads, priority support

### 1.4 Feature Gating

- **No feature gating exists** — `isPro` is never checked anywhere
- Free tier limits (50 items, 3 collections) are **not enforced**
- File/image uploads are available to all users (no Pro check in upload route)
- Sidebar shows PRO badges on file/image types but they're cosmetic only

### 1.5 Settings Page (`src/app/settings/`)

- Editor preferences, change password (email users), delete account
- **No subscription management UI**

### 1.6 API Route Pattern (`src/app/api/`)

```
api/
├── auth/           (nextauth, register, verify, forgot/reset password)
├── download/       (file download proxy)
├── items/[id]/     (item CRUD)
├── profile/        (change password, delete account)
├── settings/       (editor preferences)
└── upload/         (file upload to Supabase)
```

Pattern: auth check → try/catch → `NextResponse.json()` with `{ error }` on failure.

### 1.7 Server Action Pattern (`src/actions/`)

```
actions/
├── collections.ts  (CRUD operations)
├── items.ts        (CRUD, favorite, pin)
└── settings.ts     (editor preferences)
```

Pattern: `"use server"` → `auth()` check → Zod `safeParse` → try/catch → `{ success, data/error }`.

### 1.8 Environment Variables (`.env.example`)

No Stripe variables exist. Existing pattern uses optional commented vars with placeholder values.

---

## 2. Implementation Plan

### Phase 1: Foundation

#### 1.1 Install Stripe

```bash
npm install stripe
npm install -D @types/stripe  # if needed
```

#### 1.2 Add Stripe Config to `.env.example`

```
# Stripe (subscriptions)
# STRIPE_SECRET_KEY="sk_test_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
# STRIPE_PRICE_ID_MONTHLY="price_monthly_..."
# STRIPE_PRICE_ID_YEARLY="price_yearly_..."
```

#### 1.3 Create `src/lib/stripe.ts`

```typescript
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
})

export const MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY!
export const YEARLY_PRICE_ID = process.env.STRIPE_PRICE_ID_YEARLY!
```

#### 1.4 Update `src/types/next-auth.d.ts`

```typescript
import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isPro: boolean
    } & DefaultSession["user"]
  }
}
```

#### 1.5 Update `src/auth.ts` — Add JWT callback

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.sub = user.id
    }
    // Always sync isPro from DB to catch webhook updates
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { isPro: true },
      })
      token.isPro = dbUser?.isPro ?? false
    }
    return token
  },
  async session({ session, token }) {
    if (session.user && token.sub) {
      session.user.id = token.sub
      session.user.isPro = (token.isPro as boolean) ?? false
    }
    return session
  },
},
```

---

### Phase 2: Stripe API Routes

#### 2.1 Create Checkout Session — `src/app/api/stripe/checkout/route.ts`

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe, MONTHLY_PRICE_ID, YEARLY_PRICE_ID } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId } = await request.json()

    if (priceId !== MONTHLY_PRICE_ID && priceId !== YEARLY_PRICE_ID) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get("origin")}/settings?pro=true`,
      cancel_url: `${request.headers.get("origin")}/settings`,
      metadata: { userId: session.user.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

#### 2.2 Create Billing Portal — `src/app/api/stripe/portal/route.ts`

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${request.headers.get("origin")}/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

#### 2.3 Stripe Webhook — `src/app/api/stripe/webhook/route.ts`

```typescript
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object
        const userId = checkoutSession.metadata?.userId
        const subscriptionId = checkoutSession.subscription as string

        if (userId && subscriptionId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              stripeSubscriptionId: subscriptionId,
            },
          })
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const status = subscription.status

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPro: status === "active" || status === "trialing",
              stripeSubscriptionId:
                status === "active" || status === "trialing"
                  ? subscription.id
                  : null,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

**Important:** The webhook route must use `request.text()` (not `request.json()`) to preserve the raw body for signature verification. Next.js route handlers default to `request.text()` when the body is consumed as text, which is compatible with the Stripe raw body requirement. No raw body configuration is needed with the App Router.

---

### Phase 3: Settings Page — Subscription Management

#### 3.1 Update `src/app/settings/settings-content.tsx`

Add a subscription card between EditorPreferencesForm and Change Password:

```typescript
// Add to imports
import { CreditCard } from "lucide-react"

// Add before Change Password or Danger Zone card
{
  profile.isPro !== undefined ? ( // isPro would need to be passed
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {profile.isPro ? "DevStash Pro" : "Free Plan"}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile.isPro
                ? "You have access to all Pro features."
                : "Upgrade to unlock unlimited items, collections, AI features, and more."}
            </p>
          </div>
          <Button onClick={profile.isPro ? handleBillingPortal : handleUpgrade}>
            <CreditCard className="size-4" />
            {profile.isPro ? "Manage Subscription" : "Upgrade to Pro"}
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : null
}
```

Add handler functions:

```typescript
const handleUpgrade = async () => {
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: yearly ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  } catch {
    toast.error("Failed to start checkout")
  }
}

const handleBillingPortal = async () => {
  try {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  } catch {
    toast.error("Failed to open billing portal")
  }
}
```

#### 3.2 Update `src/app/settings/page.tsx`

Update `UserProfile` interface and the `getUserProfile` query to include `isPro`:

```typescript
// In getUserProfile query (src/lib/db/users.ts), add isPro to select
select: {
  id: true,
  name: true,
  email: true,
  image: true,
  createdAt: true,
  password: true,
  isPro: true,  // ADD THIS
}
```

Update the `UserProfile` interface:

```typescript
export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: Date
  hasPassword: boolean
  isPro: boolean  // ADD THIS
}
```

#### 3.3 Wire PricingCards to Checkout (`src/components/homepage/PricingCards.tsx`)

Replace the Free/Pro card CTAs:

- **Free card CTA:** Keep `/register` for non-authenticated users; change to `/dashboard` for authenticated users
- **Pro card CTA:** Call `/api/stripe/checkout` if authenticated, otherwise redirect to `/sign-in`

The PricingCards component is a client component, so it can use `useSession()` from next-auth/react to check auth status.

```typescript
import { useSession } from "next-auth/react"

// Inside component:
const { data: session } = useSession()

// Pro card CTA onClick handler:
const handleProCta = () => {
  if (!session) {
    window.location.href = "/sign-in"
    return
  }
  // Call checkout API
  fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceId: yearly ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.url) window.location.href = data.url
    })
}
```

---

### Phase 4: Feature Gating

#### 4.1 Free Tier Limits — Constants (`src/lib/constants.ts`)

```typescript
export const FREE_TIER_MAX_ITEMS = 50
export const FREE_TIER_MAX_COLLECTIONS = 3
```

#### 4.2 Create `src/lib/pro.ts` — Pro check helper

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FREE_TIER_MAX_ITEMS, FREE_TIER_MAX_COLLECTIONS } from "@/lib/constants"

export type ProCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string }

export async function getProStatus(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false
  return session.user.isPro ?? false
}

export async function checkItemLimit(userId: string, isPro: boolean): Promise<ProCheckResult> {
  if (isPro) return { allowed: true }
  const count = await prisma.item.count({ where: { userId } })
  if (count >= FREE_TIER_MAX_ITEMS) {
    return {
      allowed: false,
      reason: `Free plan is limited to ${FREE_TIER_MAX_ITEMS} items. Upgrade to Pro for unlimited items.`,
    }
  }
  return { allowed: true }
}

export async function checkCollectionLimit(userId: string, isPro: boolean): Promise<ProCheckResult> {
  if (isPro) return { allowed: true }
  const count = await prisma.collection.count({ where: { userId } })
  if (count >= FREE_TIER_MAX_COLLECTIONS) {
    return {
      allowed: false,
      reason: `Free plan is limited to ${FREE_TIER_MAX_COLLECTIONS} collections. Upgrade to Pro for unlimited collections.`,
    }
  }
  return { allowed: true }
}

export async function checkFileUploadAllowed(isPro: boolean): Promise<ProCheckResult> {
  if (isPro) return { allowed: true }
  return {
    allowed: false,
    reason: "File and image uploads are Pro features. Upgrade to Pro to upload files.",
  }
}
```

#### 4.3 Add Gating to Server Actions

**`src/actions/items.ts` — `createItem`:**

```typescript
import { getProStatus, checkItemLimit, checkFileUploadAllowed } from "@/lib/pro"

export async function createItem(data: CreateItemData): Promise<CreateItemResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const isPro = session.user.isPro ?? false

  // Check file upload gate
  if (data.contentType === "file" || data.contentType === "image") {
    const fileCheck = await checkFileUploadAllowed(isPro)
    if (!fileCheck.allowed) {
      return { success: false, error: fileCheck.reason }
    }
  }

  // Check item limit for non-Pro users
  const limitCheck = await checkItemLimit(session.user.id, isPro)
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  // ... rest of existing code
}
```

**`src/actions/collections.ts` — `createCollection`:**

```typescript
import { getProStatus, checkCollectionLimit } from "@/lib/pro"

export async function createCollection(data: CreateCollectionData): Promise<CreateCollectionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const isPro = session.user.isPro ?? false
  const limitCheck = await checkCollectionLimit(session.user.id, isPro)
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  // ... rest of existing code
}
```

#### 4.4 Add Gating to API Routes

**`src/app/api/upload/route.ts` — POST:**

```typescript
import { checkFileUploadAllowed } from "@/lib/pro"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileCheck = await checkFileUploadAllowed(session.user.isPro ?? false)
    if (!fileCheck.allowed) {
      return NextResponse.json({ error: fileCheck.reason }, { status: 403 })
    }

    // ... rest of existing code
  }
}
```

#### 4.5 UI Gating — Show/Hide Pro Features

**Sidebar (`src/components/dashboard/sidebar.tsx`):**
- Use `useSession()` to get `isPro` status
- Conditionally show/hide or disable file/image type links for non-Pro users

**Create Item Dialog:**
- Hide file/image type options for non-Pro users
- Show an "Upgrade to Pro" tooltip or badge

**AI Features:**
- Gate AI feature calls behind `isPro` check in server actions

---

### Phase 5: Stripe Dashboard Setup

#### 5.1 Create Products and Prices

| Product | Price Type | Amount | Interval |
|---------|-----------|--------|----------|
| DevStash Pro Monthly | Recurring | $8.00 | month |
| DevStash Pro Yearly | Recurring | $72.00 | year |

Steps:
1. Go to Stripe Dashboard → Products → Add Product
2. Name: "DevStash Pro"
3. Create two prices:
   - Monthly: $8.00/month (price ID: `price_...`)
   - Yearly: $72.00/year (price ID: `price_...`)
4. Copy price IDs to `.env` as `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`

#### 5.2 Configure Webhook Endpoint

1. Stripe Dashboard → Developers → Webhooks → Add Endpoint
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`
5. For local development, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   This outputs a `whsec_...` secret to use in local `.env`.

#### 5.3 API Keys

1. Stripe Dashboard → Developers → API Keys
2. Copy **Publishable key** (`pk_test_...`) to `.env` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** (`sk_test_...`) to `.env` as `STRIPE_SECRET_KEY`

---

### Phase 6: Testing Checklist

#### 6.1 Local Testing

- [ ] Stripe CLI webhook forwarding running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] `.env` has all 5 Stripe variables set (test keys)

#### 6.2 Checkout Flow

- [ ] Click "Upgrade to Pro" on settings page → redirects to Stripe checkout
- [ ] Complete payment with Stripe test card (`4242 4242 4242 4242`)
- [ ] After redirect back to `/settings?pro=true`, page shows Pro status
- [ ] Reload page → session picks up `isPro: true` via JWT callback
- [ ] PricingCards "Upgrade to Pro" button redirects signed-in users to checkout
- [ ] PricingCards "Upgrade to Pro" button redirects non-signed-in users to sign-in

#### 6.3 Webhook Handling

- [ ] `checkout.session.completed` sets `isPro=true` and `stripeSubscriptionId`
- [ ] `customer.subscription.deleted` sets `isPro=false`
- [ ] Successful subscription update preserves `isPro=true`
- [ ] Failed payment does not change `isPro` (Stripe handles retries)

#### 6.4 Billing Portal

- [ ] "Manage Subscription" button opens Stripe Customer Portal
- [ ] Can upgrade from monthly to yearly in portal
- [ ] Can cancel subscription in portal
- [ ] Can update payment method in portal
- [ ] After cancellation, webhook correctly sets `isPro=false`

#### 6.5 Feature Gating (Free Tier)

- [ ] Free user cannot create more than 50 items (server action returns error)
- [ ] Free user cannot create more than 3 collections (server action returns error)
- [ ] Free user gets error when uploading file via upload API route
- [ ] Free user cannot select file/image type in create item dialog
- [ ] Pro user can create unlimited items and collections
- [ ] Pro user can upload files and images

#### 6.6 Session Sync

- [ ] After webhook updates `isPro` in DB, next JWT callback reads the new value
- [ ] Page reload after checkout shows Pro status in session
- [ ] Sign out and sign back in preserves Pro status

#### 6.7 Error States

- [ ] Expired/invalid webhook signature returns 400
- [ ] Unauthenticated checkout request returns 401
- [ ] Invalid price ID returns 400
- [ ] No subscription for portal request returns 400
- [ ] Stripe API errors return 500 with generic message

---

### Phase 7: Implementation Order

| Step | Task | Files | Depends On |
|------|------|-------|------------|
| 1 | Install Stripe, add env vars | `package.json`, `.env.example` | — |
| 2 | Create Stripe client | `src/lib/stripe.ts` | Step 1 |
| 3 | Update NextAuth + session types | `src/auth.ts`, `src/types/next-auth.d.ts` | Step 2 |
| 4 | Create checkout API route | `src/app/api/stripe/checkout/route.ts` | Steps 2-3 |
| 5 | Create webhook API route | `src/app/api/stripe/webhook/route.ts` | Step 2 |
| 6 | Create billing portal API route | `src/app/api/stripe/portal/route.ts` | Steps 2-3 |
| 7 | Add subscription card to settings | `src/app/settings/page.tsx`, `settings-content.tsx` | Steps 4-6 |
| 8 | Wire PricingCards to checkout | `src/components/homepage/PricingCards.tsx` | Step 4 |
| 9 | Add free tier constants | `src/lib/constants.ts` | — |
| 10 | Create Pro check helper | `src/lib/pro.ts` | Step 9 |
| 11 | Gate server actions | `src/actions/items.ts`, `src/actions/collections.ts` | Steps 3, 10 |
| 12 | Gate API routes | `src/app/api/upload/route.ts` | Steps 3, 10 |
| 13 | Gate UI components | sidebar, create item dialog | Step 3 |
| 14 | Stripe Dashboard setup | Products, webhook, API keys | — |
| 15 | End-to-end testing | — | Steps 1-14 |

---

## Files Summary

### New Files (6)

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client singleton + price ID constants |
| `src/lib/pro.ts` | Pro status check helpers for feature gating |
| `src/app/api/stripe/checkout/route.ts` | Create Stripe checkout session |
| `src/app/api/stripe/portal/route.ts` | Create Stripe billing portal session |
| `src/app/api/stripe/webhook/route.ts` | Handle Stripe webhook events |

### Modified Files (11)

| File | Changes |
|------|---------|
| `package.json` | Add `stripe` dependency |
| `.env.example` | Add 5 Stripe environment variables |
| `src/auth.ts` | Add `jwt` callback, update `session` callback to include `isPro` |
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to `Session.user` |
| `src/lib/constants.ts` | Add `FREE_TIER_MAX_ITEMS`, `FREE_TIER_MAX_COLLECTIONS` |
| `src/lib/db/users.ts` | Add `isPro` to `UserProfile` interface and query select |
| `src/app/settings/page.tsx` | Pass `profile` with `isPro` to `SettingsContent` |
| `src/app/settings/settings-content.tsx` | Add subscription management card |
| `src/components/homepage/PricingCards.tsx` | Wire Pro CTA to checkout, Free CTA to dashboard |
| `src/actions/items.ts` | Add Pro checks to `createItem` |
| `src/actions/collections.ts` | Add Pro check to `createCollection` |
| `src/app/api/upload/route.ts` | Add Pro check before file upload |

---

## Key Design Decisions

1. **JWT callback syncs `isPro` on every validation** — adds one small DB query per session refresh but guarantees the session picks up webhook updates without requiring the user to sign out/in. A page reload after checkout is sufficient.

2. **No Stripe raw body configuration needed** — Next.js App Router route handlers consume `request.text()` which preserves the raw body. The webhook handler uses `request.text()` then passes the raw string to `stripe.webhooks.constructEvent()`.

3. **Feature gating is server-side** — checks happen in server actions and API routes, not client-side. UI gating (hiding Pro features) is a convenience, not a security boundary.

4. **Webhook is the source of truth** — `isPro` is only changed by the webhook, never by the client. The checkout session redirects back to the app, and the next JWT callback (triggered by the redirect) picks up the change.

5. **Billing portal for subscription management** — all plan changes (upgrade, downgrade, cancel) happen through Stripe's hosted portal, not custom UI. This avoids PCI compliance scope and keeps the codebase simple.

6. **`checkout.session.completed` webhook** — Using this instead of `invoice.paid` because the checkout flow is a single event that marks subscription start, while `invoice.paid` fires on every renewal and would cause redundant DB writes.

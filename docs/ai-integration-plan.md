# AI Integration Plan — OpenRouter (DeepSeek V4 Flash)

## Approach

**Direct `fetch` to OpenRouter API** (OpenAI-compatible Chat Completions format).

OpenRouter provides a free tier for `deepseek/deepseek-v4-flash:free` with rate limits, no credit card required.

```typescript
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": "https://devstashproject.vercel.app",
    "X-Title": "DevStash",
  },
  body: JSON.stringify({
    model: "deepseek/deepseek-v4-flash:free",
    messages: [...],
  }),
})
```

---

## Prisma Schema — No Changes Needed

The existing schema already supports AI features:

| Feature | Schema mapping |
|---|---|
| Auto-tagging | `Item` → `tags` (via `TagsOnItems`), `Tag.name` |
| AI summaries | `Item.description` |
| Code explanation | `Item.content` + `Item.language` |
| Prompt optimization | `Item.content` |

No schema migrations required for v1.

---

## Environment Variables

Add to `.env`:

```env
OPENROUTER_API_KEY="sk-or-v1-..."
```

Get the API key from [openrouter.ai](https://openrouter.ai). Free tier available, no credit card required.

---

## Architecture Overview

```
Client Component
  └─ calls Server Action (or API Route)
       ├─ Auth check (session.user.id)
       ├─ Pro gating (session.user.isPro)
       ├─ Rate limit check (Upstash Redis)
       ├─ Zod validation of input
       ├─ DeepSeek API call
       │    ├─ generateText (non-streaming: auto-tag, summarize, explain)
       │    └─ streamText  (streaming: explain, optimize prompt)
       ├─ DB persistence (if needed)
       └─ Return result
```

---

## 1. AI Utility Library (`src/lib/ai.ts`)

Direct `fetch` to OpenRouter API:

```typescript
export async function generate(prompt: string, system?: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://devstashproject.vercel.app",
      "X-Title": "DevStash",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-v4-flash:free",
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  })
  // handle response...
}
```

---

## 2. Pro Gating

AI features are **Pro-only**. Add `checkAiAccess` to `src/lib/pro.ts`:

```typescript
export function checkAiAccess(isPro: boolean): ProCheckResult {
  if (isPro) return { allowed: true }
  return {
    allowed: false,
    reason: "AI features are a Pro feature. Upgrade to unlock.",
  }
}
```

Usage in every AI action:

```typescript
const aiCheck = checkAiAccess(session.user.isPro)
if (!aiCheck.allowed) {
  return { success: false, error: aiCheck.reason }
}
```

---

## 3. Rate Limiting

Uses existing `src/lib/rate-limit.ts` (Upstash Redis) with 20 requests/minute per user.

```typescript
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"

const { success } = await checkRateLimit(rateLimiters.explainCode, session.user.id)
if (!success) {
  return { success: false, error: "Too many AI requests. Try again later." }
}
```

---

## 4. Server Actions

### 4a. Code Explanation (`src/actions/ai.ts` — implemented)

Uses `generateText` (non-streaming). Returns `{ success: true, explanation: string }`.

Prompt: "Explain this {language} concisely (~200-300 words). Cover what it does and key concepts."

### 4b. Auto-tagging (future)

### 4c. AI Summaries (future)

---

## 5. Cost Optimization

| Strategy | Description |
|---|---|
| Model choice | `deepseek/deepseek-v4-flash:free` — free tier via OpenRouter |
| Minimum content length | Skip AI calls for content < 50 chars |
| Input truncation | Truncate content to 10K chars before sending |
| Pro-only gating | Free users never incur costs |

---

## 6. Security

| Concern | Mitigation |
|---|---|
| API key exposure | Server-side only, in `.env`, never in client bundle |
| Prompt injection | Sanitize input: enforce max length |
| User data leakage | Logging: never log full content |
| Rate limit abuse | Upstash Redis rate limiter per user |
| Pro check bypass | Server-side check in every action |

---

## 7. Testing Strategy

Mock `@/lib/ai` to return controlled responses. Test: auth failures, Pro gating, valid inputs, empty inputs, API errors.

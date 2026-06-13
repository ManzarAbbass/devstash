# Auth Security Review

**Date:** 2026-06-13
**Project:** DevStash
**Auth Framework:** NextAuth v5 (JWT strategy, PrismaAdapter)
**Audited by:** Auth Security Auditor subagent

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 1 |
| Medium   | 2 |
| Low      | 1 |
| **Total** | **4** |

**Overview:** The authentication implementation follows good security practices overall. Password hashing uses bcrypt, tokens are generated with `crypto.randomUUID()`, sessions are validated server-side, and API routes properly scope operations to the authenticated user. The main gaps are the absence of rate limiting on auth endpoints and old password reset tokens not being invalidated when a new one is created.

---

## Passed Checks

### 1. Password Hashing & Storage

- ✓ **Bcrypt used for all hashing operations** — Every password hashing operation uses bcryptjs (`src/lib/verification-token.ts:59`, `src/app/api/auth/register/route.ts:40`, `src/app/api/profile/change-password/route.ts:37`)
- ✓ **Salt rounds >= 10 in all locations** — Register uses 12 (`src/app/api/auth/register/route.ts:40`), Change Password uses 10 (`src/app/api/profile/change-password/route.ts:37`), Reset Password uses 12 (`src/lib/verification-token.ts:59`)
- ✓ **Raw passwords are never logged** — No `console.log`, `console.error`, or any logging of password values found anywhere in the codebase
- ✓ **Raw passwords are never returned in API responses** — All auth API routes return only status messages and error strings, never passwords or hashes

### 2. Email Verification Flow

- ✓ **Cryptographically secure token generation** — `randomUUID()` from `node:crypto` used for all tokens (`src/lib/verification-token.ts:6,38`)
- ✓ **Reasonable 24-hour token expiration** — `Date.now() + 1000 * 60 * 60 * 24` (`src/lib/verification-token.ts:12`)
- ✓ **Token is single-use** — Deleted from database after successful verification (`src/lib/verification-token.ts:32`)
- ✓ **Verify endpoint does not expose internal error details** — Returns generic messages: "Missing verification token", "expired", "Invalid verification link" (`src/app/api/auth/verify-email/route.ts:9-18`)
- ✓ **Email verification is toggleable** — Controlled via `EMAIL_VERIFICATION` env var (`src/auth.ts:33`, `src/app/api/auth/register/route.ts:42`)
- ✓ **Login blocks unverified emails when verification enabled** — Checks `emailVerified` in Credentials authorize callback (`src/auth.ts:33-34`)

### 3. Password Reset Flow

- ✓ **Cryptographically secure token generation** — Same `randomUUID()` from `node:crypto` (`src/lib/verification-token.ts:38`)
- ✓ **1-hour token expiration** — `Date.now() + 1000 * 60 * 60` (`src/lib/verification-token.ts:44`)
- ✓ **Token is single-use** — Deleted from database after successful password reset (`src/lib/verification-token.ts:66`)
- ✓ **Forgot-password endpoint does not reveal whether email exists** — Same message returned for both found and not-found users (`src/app/api/auth/forgot-password/route.ts:24,34`)
- ✓ **Server-side password validation on reset** — Minimum length of 6 enforced (`src/app/api/auth/reset-password/route.ts:15-20`)
- ✓ **Reset cannot target another user** — Token is tied to email (identifier) via `VerificationToken` model, and update uses the email from the token record (`src/lib/verification-token.ts:61-63`)
- ✓ **Password reset link points to frontend page** — Uses `/reset-password?token=${token}` instead of a raw API endpoint, allowing for a proper UI (`src/lib/email.ts:49`)

### 4. Profile Page & Session Validation

- ✓ **Profile page validates session server-side** — Uses `auth()` in the server component before rendering (`src/app/profile/page.tsx:11-12`)
- ✓ **Profile API routes validate session** — Both `change-password` and `delete-account` check `auth()` at the start (`src/app/api/profile/change-password/route.ts:8-11`, `src/app/api/profile/delete-account/route.ts:7-10`)
- ✓ **User ID sourced from session, not request** — All profile operations use `session.user.id`, never user-supplied IDs (`src/app/api/profile/change-password/route.ts:24`, `src/app/api/profile/delete-account/route.ts:14`)
- ✓ **Change password verifies current password** — Uses `bcrypt.compare` to validate current password before allowing change (`src/app/api/profile/change-password/route.ts:32-35`)
- ✓ **Delete account re-authenticates credential users** — Requires password input for users with a password (`src/app/api/profile/delete-account/route.ts:18-26`)
- ✓ **Delete account skips password check for OAuth-only users** — Correctly handles users without a password (`src/app/api/profile/delete-account/route.ts:18-19`)
- ✓ **No sensitive data leaked in profile API responses** — Returns only `message` strings, no password hashes or tokens

### 5. General Auth Patterns

- ✓ **Prisma adapter used** — Proper database-backed user/account/session management via `@auth/prisma-adapter` (`src/auth.ts:2`)
- ✓ **JWT session strategy** — Stateless JWT sessions used, no server-side session storage needed (`src/auth.ts:12`)
- ✓ **Custom sign-in page configured** — Redirects to `/sign-in` instead of NextAuth default (`src/auth.ts:13`)
- ✓ **GitHub OAuth provider configured** — OAuth state parameter handled by NextAuth v5 (`src/auth.config.ts:5`)
- ✓ **NextAuth route handler is standard** — Simple re-export: `export { GET, POST } from "@/auth"` (`src/app/api/auth/[...nextauth]/route.ts:1`)
- ✓ **Register endpoint validates server-side** — Checks for missing fields, password match, minimum length, and duplicate user (`src/app/api/auth/register/route.ts:11-37`)
- ✓ **All API routes wrap logic in try/catch** — Prevent stack trace exposure on errors, all return generic "Internal server error" (`src/app/api/auth/register/route.ts:68-73`, and all other API routes)

---

## Issues Found

### [High] No Rate Limiting on Auth Endpoints

- **Location:** All auth endpoints — `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/verify-email/route.ts`, `src/app/api/auth/check-email/route.ts`, `src/app/api/profile/change-password/route.ts`, `src/app/api/profile/delete-account/route.ts`
- **Description:** None of the authentication or profile endpoints implement any form of rate limiting. There is no middleware, no `express-rate-limit`, no `@upstash/ratelimit`, and no custom rate limiting logic anywhere in the codebase. Searches for "rateLimit", "rate-limit", "ratelimit", "express-rate-limit", and "upstash" returned zero results.
- **Risk:** **HIGH** — Without rate limiting:
  - The login endpoint (handled by NextAuth Credentials provider) is vulnerable to brute-force password guessing
  - The forgot-password endpoint can be abused to spam email addresses with reset emails (denial-of-service via email)
  - The register endpoint can be used to create accounts in bulk
  - The change-password and delete-account endpoints (while session-protected) are still vulnerable to abuse if a session is compromised
- **Fix:** Implement rate limiting on all auth endpoints. Recommended approaches:
  - **Option A:** Use a lightweight in-memory solution for single-instance deployments (e.g., a `Map<string, { count: number; resetTime: number }>` in a shared utility)
  - **Option B:** Use `@upstash/ratelimit` with Redis for distributed rate limiting (recommended for production)
  - **Option C:** Use a middleware-based approach with a rate limiting library
  - Suggested limits: 5 forgot-password requests per email per hour, 10 register attempts per IP per hour, 100 login attempts per IP per minute

---

### [Medium] Old Password Reset Tokens Not Invalidated on New Request

- **Location:** `src/lib/verification-token.ts:37-49`
- **Description:** When `createPasswordResetToken()` is called, it creates a new `VerificationToken` record without deleting or invalidating any existing (unused) password reset tokens for the same email. Multiple valid reset tokens can coexist for the same user.
- **Risk:** **MEDIUM** — If a user requests multiple password resets, all previously emailed links remain valid. An attacker who gains access to an old reset email (compromised inbox, leaked email archive) could use a stale but unexpired link to reset the user's password, even after the user has already successfully used a newer link or changed their mind. The 1-hour expiry limits the window, but it is still a window.
- **Fix:** Delete existing tokens for the same email before creating a new one:
  ```typescript
  export async function createPasswordResetToken(email: string) {
    // Invalidate any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    const token = randomUUID()

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    })

    return token
  }
  ```
  Apply the same pattern to `createVerificationToken()` for defense-in-depth on email verification tokens (though lower risk since registration is a one-time event per email).

---

### [Medium] Inconsistent bcrypt Salt Rounds Across Password Operations

- **Location:**
  - Register: `src/app/api/auth/register/route.ts:40` — uses **12** rounds
  - Change Password: `src/app/api/profile/change-password/route.ts:37` — uses **10** rounds
  - Reset Password: `src/lib/verification-token.ts:59` — uses **12** rounds
- **Description:** The bcrypt salt rounds are not consistent across all password hashing operations. Register and reset-password use 12 rounds, while change-password uses only 10 rounds. While both values are above the minimum threshold of 10, the inconsistency can lead to confusion, maintenance issues, and potential future regression where new code uses the wrong value.
- **Risk:** **MEDIUM** — Currently all values are adequate (>= 10). However, inconsistency indicates a lack of centralized configuration. Over time, as developers add new password operations, they may not know which value to use. The change-password endpoint using 10 rounds instead of 12 means user password hashes get downgraded from 12 to 10 rounds when changed via the profile page.
- **Fix:** Extract the salt rounds to a shared constant and use it everywhere:
  ```typescript
  // src/lib/auth.ts or similar shared location
  export const BCRYPT_SALT_ROUNDS = 12
  ```
  Then reference `BCRYPT_SALT_ROUNDS` consistently in all three locations.

---

### [Low] check-email Endpoint Leaks User Existence and Verification Status

- **Location:** `src/app/api/auth/check-email/route.ts:17-20`
- **Description:** The `/api/auth/check-email` endpoint is publicly accessible with no authentication requirements and returns `{ exists: boolean, verified: boolean }` for any email address. This allows anyone to enumerate registered email addresses and determine their verification status.
- **Risk:** **LOW** — This is a deliberate feature endpoint (likely used by the frontend for real-time validation during sign-up). The information disclosed is minimal (email existence + verification status) and does not expose any sensitive data. However, it does enable email enumeration, which can be used for:
  - Verifying if a user is registered with a given email
  - Targeting unverified accounts for social engineering
  - Building a list of active users for phishing (in combination with other data)
- **Fix:** Three options depending on product requirements:
  - **Option A (Recommended):** Rate-limit this endpoint to slow down bulk enumeration (5 requests per IP per minute)
  - **Option B:** Remove the endpoint entirely if it's not used by the frontend
  - **Option C:** Always return `{ exists: false, verified: false }` for unauthenticated requests (defeats the purpose of the endpoint for sign-up UX)

---

## Notes

- **No middleware.ts exists** — Route protection is handled per-page/per-route via `auth()` calls. This is acceptable for a Next.js App Router project but means there is no centralized place to add middleware-level rate limiting.
- **Delete-account route uses dynamic import for bcrypt** (`src/app/api/profile/delete-account/route.ts:22`) — This is functional but inconsistent with the top-level import used elsewhere. Not a security issue, but a code consistency note.
- **Email verification tokens also lack old-token cleanup** (`src/lib/verification-token.ts:5-17`) — This is a lower concern because registration is a one-time event (duplicate registrations are rejected with 409), so only one verification token per email can exist.

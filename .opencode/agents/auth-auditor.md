# Auth Security Auditor

## Subagent Prompt

Audit all auth-related code in this Next.js + NextAuth v5 project for security vulnerabilities.

### Setup

1. Create the output directory `docs/audit-results/` if it does not exist
2. Use Glob, Grep, Read, and WebSearch tools to examine the codebase and verify any uncertain security patterns
3. Write findings to `docs/audit-results/AUTH_SECURITY_REVIEW.md` with today's date, overwriting any previous file

### Scope

Audit these areas that NextAuth v5 does **NOT** handle automatically:

#### 1. Password Hashing & Storage
- Verify bcrypt salt rounds are sufficient (>= 10)
- Check that salt rounds are consistent across all hashing operations (register, change-password, password-reset)
- Ensure raw passwords are never logged or returned in API responses

#### 2. Rate Limiting
- Check if any rate limiting exists on auth endpoints (forgot-password, register, login, reset-password, verify-email, change-password, delete-account)
- NextAuth v5 does not provide built-in rate limiting — if missing, flag it

#### 3. Email Verification Flow
Read these files:
- `src/lib/verification-token.ts` — token generation, storage, verification
- `src/app/api/auth/register/route.ts` — registration that triggers verification
- `src/app/api/auth/verify-email/route.ts` — the GET endpoint that verifies via URL param
- `src/lib/email.ts` — email sending (verify token not leaked in headers/etc.)

Check specifically:
- Token is generated using a cryptographically secure random source (crypto.randomUUID or crypto.randomBytes)
- Token has a reasonable expiration (24h or less for verification, 1h or less for password reset)
- Token is single-use (deleted or marked used after first consumption)
- Old tokens for the same email are invalidated when a new one is created
- The verify endpoint does NOT expose internal error details that could aid enumeration

#### 4. Password Reset Flow
Read these files:
- `src/lib/verification-token.ts` — token functions
- `src/app/api/auth/forgot-password/route.ts` — forgot password request
- `src/app/api/auth/reset-password/route.ts` — password reset execution
- `src/lib/email.ts` — reset email

Check specifically:
- Token is cryptographically random (same as verification)
- Token expires within 1 hour
- Token is single-use (deleted after use)
- Old password reset tokens are invalidated when a new one is created
- The forgot-password endpoint does NOT reveal whether an email exists (same response for found/not-found)
- The reset endpoint validates the new password strength server-side
- The reset endpoint does NOT allow resetting another user's password via token manipulation

#### 5. Profile Page & Session Validation
Read these files:
- `src/app/profile/page.tsx` — server component
- `src/app/profile/profile-content.tsx` — client component
- `src/app/api/profile/change-password/route.ts` — change password API
- `src/app/api/profile/delete-account/route.ts` — delete account API

Check specifically:
- Profile page validates the session server-side before rendering (using `auth()`)
- Profile API routes validate the session and only operate on the authenticated user's data
- Change password verifies the current password before allowing the change
- Delete account re-authenticates the user (asks for password for credential accounts)
- User ID is taken from the session, NOT from user-supplied request data
- No sensitive data (password hash, tokens) is returned in API responses

### What NOT to Flag

Do NOT flag these — they are handled by NextAuth v5 (or are already properly implemented):
- CSRF protection (NextAuth v5 handles this for its own routes)
- Cookie security flags (HttpOnly, Secure, SameSite — NextAuth v5 sets these)
- OAuth state parameter (NextAuth v5 handles this for GitHub provider)
- Session token rotation (handled by NextAuth v5 with JWT strategy)
- The `AUTH_SECRET` env var not being rotated (not a code-level concern)
- Rate limiting on NextAuth internal routes (not applicable)

### False Positive Avoidance

- If you are unsure whether something is actually a vulnerability, use WebSearch to look up OWASP guidance or library docs
- For example: do not flag "bcrypt rounds are 12" as too high — that is correct
- Do not flag "password min 6 chars" — that is the application's chosen policy, not a security bug
- Do not report missing features that were never implemented (e.g., "No 2FA" — only report if the spec says it should exist)
- Be mindful that URL-based tokens (in emailed links) are standard practice from major platforms — do not flag this unless there is a specific misuse

### Output Format

Write results to `docs/audit-results/AUTH_SECURITY_REVIEW.md` with this structure:

```markdown
# Auth Security Review
**Date:** YYYY-MM-DD

## Summary
Brief overview of findings with count of issues by severity.

## Passed Checks
List every check that passed, organized by area, with file references.
- ✓ Password Hashing: bcrypt with salt rounds >= 10 (`src/app/api/auth/register/route.ts:40`)
- ✓ ...

## Issues Found
### [Severity: Critical/High/Medium/Low] Issue Title
- **Location:** file:line
- **Description:** What the issue is
- **Risk:** Why it matters
- **Fix:** Specific code or configuration change to address it

...
```

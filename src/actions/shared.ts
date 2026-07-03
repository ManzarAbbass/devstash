import { z } from "zod"
import { auth } from "@/auth"
import type { Ratelimit } from "@upstash/ratelimit"
import type { DataResult, FieldResult, VoidResult } from "@/types/actions"

export async function requireAuth(): Promise<DataResult<import("next-auth").Session>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  return { success: true, data: session }
}

export function parseFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): FieldResult<T> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (!fieldErrors[key]) fieldErrors[key] = []
      fieldErrors[key].push(issue.message)
    }
    return { success: false, error: fieldErrors }
  }
  return { success: true, data: parsed.data }
}

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): DataResult<T> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid input" }
  return { success: true, data: parsed.data }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<DataResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch {
    return { success: false, error: errorMessage }
  }
}

export async function withVoidHandling(
  fn: () => Promise<unknown>,
  errorMessage: string
): Promise<VoidResult> {
  try {
    await fn()
    return { success: true }
  } catch {
    return { success: false, error: errorMessage }
  }
}

export async function withAiGuard(
  rateLimiter: Ratelimit,
  userId: string,
  isPro: boolean
): Promise<DataResult<true>> {
  const { checkAiAccess } = await import("@/lib/pro")
  const { checkRateLimit } = await import("@/lib/rate-limit")

  const aiCheck = checkAiAccess(isPro)
  if (!aiCheck.allowed) return { success: false, error: aiCheck.reason }

  const result = await checkRateLimit(rateLimiter, userId)
  if (!result.success) return { success: false, error: "Too many AI requests. Try again later." }

  return { success: true, data: true as const }
}

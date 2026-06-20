import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL is not set")
}
if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN is not set")
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const rateLimiters = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "ratelimit:login",
  }),
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "ratelimit:register",
  }),
  forgotPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "ratelimit:forgot-password",
  }),
  resetPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "ratelimit:reset-password",
  }),
  resendVerification: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "15 m"),
    prefix: "ratelimit:resend-verification",
  }),
}

export function getIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  return xff?.split(",")[0]?.trim() || "127.0.0.1"
}

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
) {
  try {
    return await limiter.limit(identifier)
  } catch {
    return { success: true, remaining: 1, reset: 0 }
  }
}

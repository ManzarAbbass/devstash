import { describe, it, expect, vi, beforeEach } from "vitest"
import { explainCode, optimizePrompt } from "@/actions/ai"

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/ai", () => ({
  generate: vi.fn(),
}))

vi.mock("@/lib/pro", () => ({
  checkAiAccess: vi.fn(),
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimiters: {
    explainCode: {},
    optimizePrompt: {},
  },
  checkRateLimit: vi.fn(),
}))

import { auth } from "@/auth"
import { generate } from "@/lib/ai"
import { checkAiAccess } from "@/lib/pro"
import { checkRateLimit } from "@/lib/rate-limit"

const mockSession = { user: { id: "user-1", email: "test@test.com", isPro: true } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(mockSession)
  vi.mocked(checkAiAccess).mockReturnValue({ allowed: true })
  vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 19, limit: 20, reset: 0 })
})

describe("explainCode action", () => {
  it("returns explanation successfully", async () => {
    vi.mocked(generate).mockResolvedValue({
      text: "This code defines a function that logs a message.",
      toolCalls: [],
      toolResults: [],
      finishReason: "stop",
      usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 },
      experimental_providerMetadata: undefined,
      response: { id: "1", modelId: "gemini-1.5-flash", timestamp: new Date(), headers: {} },
      warnings: undefined,
      steps: [],
    })

    const result = await explainCode({
      content: "console.log('hello')",
      language: "javascript",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.explanation).toBe("This code defines a function that logs a message.")
    }
    expect(auth).toHaveBeenCalledOnce()
    expect(generate).toHaveBeenCalledOnce()
    expect(checkRateLimit).toHaveBeenCalledOnce()
  })

  it("returns unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await explainCode({ content: "test" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Unauthorized")
    }
  })

  it("returns error when Pro access denied", async () => {
    vi.mocked(checkAiAccess).mockReturnValue({
      allowed: false,
      reason: "AI features are a Pro feature. Upgrade to unlock.",
    })

    const result = await explainCode({ content: "test" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("AI features are a Pro feature. Upgrade to unlock.")
    }
  })

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0, limit: 20, reset: Date.now() + 60000 })

    const result = await explainCode({ content: "test" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Too many AI requests. Try again later.")
    }
  })

  it("rejects empty content", async () => {
    const result = await explainCode({ content: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Invalid input")
    }
  })

  it("handles AI generation failure", async () => {
    vi.mocked(generate).mockRejectedValue(new Error("API error"))

    const result = await explainCode({ content: "some code" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Failed to generate explanation. Please try again.")
    }
  })
})

describe("optimizePrompt action", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession)
    vi.mocked(checkAiAccess).mockReturnValue({ allowed: true })
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 19, limit: 20, reset: 0 })
  })

  it("returns optimized prompt successfully", async () => {
    vi.mocked(generate).mockResolvedValue({
      text: "Improved prompt that is clearer and more specific.",
      toolCalls: [],
      toolResults: [],
      finishReason: "stop",
      usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 },
      experimental_providerMetadata: undefined,
      response: { id: "1", modelId: "deepseek/deepseek-v4-flash", timestamp: new Date(), headers: {} },
      warnings: undefined,
      steps: [],
    })

    const result = await optimizePrompt({ content: "Write code" })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.optimized).toBe("Improved prompt that is clearer and more specific.")
    }
    expect(auth).toHaveBeenCalledOnce()
    expect(generate).toHaveBeenCalledOnce()
    expect(checkRateLimit).toHaveBeenCalledOnce()
  })

  it("returns unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await optimizePrompt({ content: "test" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Unauthorized")
    }
  })

  it("returns error when Pro access denied", async () => {
    vi.mocked(checkAiAccess).mockReturnValue({
      allowed: false,
      reason: "AI features are a Pro feature. Upgrade to unlock.",
    })

    const result = await optimizePrompt({ content: "test" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("AI features are a Pro feature. Upgrade to unlock.")
    }
  })

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0, limit: 20, reset: Date.now() + 60000 })

    const result = await optimizePrompt({ content: "test" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Too many AI requests. Try again later.")
    }
  })

  it("rejects empty content", async () => {
    const result = await optimizePrompt({ content: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Invalid input")
    }
  })

  it("handles AI generation failure", async () => {
    vi.mocked(generate).mockRejectedValue(new Error("API error"))

    const result = await optimizePrompt({ content: "some prompt" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Failed to optimize prompt. Please try again.")
    }
  })
})

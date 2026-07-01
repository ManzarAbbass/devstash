"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { generate } from "@/lib/ai"
import { checkAiAccess } from "@/lib/pro"
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"

const explainCodeSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.string().optional(),
})

export type ExplainCodeData = z.infer<typeof explainCodeSchema>

export type ExplainCodeResult =
  | { success: true; explanation: string }
  | { success: false; error: string }

export async function explainCode(data: ExplainCodeData): Promise<ExplainCodeResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const aiCheck = checkAiAccess(session.user.isPro)
  if (!aiCheck.allowed) {
    return { success: false, error: aiCheck.reason }
  }

  const parsed = explainCodeSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const { success } = await checkRateLimit(rateLimiters.explainCode, session.user.id)
  if (!success) {
    return { success: false, error: "Too many AI requests. Try again later." }
  }

  try {
    const { text } = await generate(
      `Explain this ${parsed.data.language || "code"} concisely (~200-300 words). Cover what it does and key concepts:\n\n${parsed.data.content}`,
      "You are a code explanation assistant. Provide clear, concise explanations.",
    )

    return { success: true, explanation: text }
  } catch (err) {
    console.error("explainCode error:", err)
    return { success: false, error: "Failed to generate explanation. Please try again." }
  }
}

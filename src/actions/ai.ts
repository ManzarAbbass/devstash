"use server"

import { z } from "zod"
import { generate } from "@/lib/ai"
import { rateLimiters } from "@/lib/rate-limit"
import { requireAuth, validateInput, withAiGuard } from "@/actions/shared"
import type { DataResult } from "@/types/actions"

const explainCodeSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.string().optional(),
})

export type ExplainCodeData = z.infer<typeof explainCodeSchema>

export type ExplainCodeResult =
  | { success: true; explanation: string }
  | { success: false; error: string }

const suggestTagsSchema = z.object({
  title: z.string().min(1).max(500),
})

export type SuggestTagsData = z.infer<typeof suggestTagsSchema>

export type SuggestTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string }

export async function suggestTags(data: SuggestTagsData): Promise<SuggestTagsResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const guard = await withAiGuard(rateLimiters.suggestTags, auth.data.user.id, auth.data.user.isPro)
  if (!guard.success) return guard

  const parsed = validateInput(suggestTagsSchema, data)
  if (!parsed.success) return parsed

  try {
    const { text } = await generate(
      `Given the title "${parsed.data.title}", suggest 1-5 relevant tags for a developer's knowledge stash item. Return ONLY a comma-separated list of tags, nothing else. Tags should be lowercase single words or short phrases.`,
      "You are a tag suggestion assistant. Return only comma-separated tags.",
    )

    const tags = text
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .slice(0, 5)

    return { success: true, tags }
  } catch (err) {
    console.error("suggestTags error:", err)
    return { success: false, error: "Failed to suggest tags. Please try again." }
  }
}

const suggestDescriptionSchema = z.object({
  title: z.string().min(1).max(500),
})

export type SuggestDescriptionData = z.infer<typeof suggestDescriptionSchema>

export type SuggestDescriptionResult =
  | { success: true; description: string }
  | { success: false; error: string }

export async function suggestDescription(data: SuggestDescriptionData): Promise<SuggestDescriptionResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const guard = await withAiGuard(rateLimiters.suggestDescription, auth.data.user.id, auth.data.user.isPro)
  if (!guard.success) return guard

  const parsed = validateInput(suggestDescriptionSchema, data)
  if (!parsed.success) return parsed

  try {
    const { text } = await generate(
      `Given the title "${parsed.data.title}", write a concise 1-2 sentence description for a developer's knowledge stash item. Be specific and descriptive. Return ONLY the description text, nothing else.`,
      "You are a description generation assistant. Return only the description text.",
    )

    return { success: true, description: text.trim() }
  } catch (err) {
    console.error("suggestDescription error:", err)
    return { success: false, error: "Failed to suggest description. Please try again." }
  }
}

const optimizePromptSchema = z.object({
  content: z.string().min(1).max(10000),
})

export type OptimizePromptData = z.infer<typeof optimizePromptSchema>

export type OptimizePromptResult =
  | { success: true; optimized: string }
  | { success: false; error: string }

export async function optimizePrompt(data: OptimizePromptData): Promise<OptimizePromptResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const guard = await withAiGuard(rateLimiters.optimizePrompt, auth.data.user.id, auth.data.user.isPro)
  if (!guard.success) return guard

  const parsed = validateInput(optimizePromptSchema, data)
  if (!parsed.success) return parsed

  try {
    const { text } = await generate(
      `You are an expert prompt engineer. Rewrite and improve the following prompt to make it clearer, more specific, and more effective. Return ONLY the optimized prompt text, nothing else — no explanations, no meta-commentary.\n\nOriginal prompt:\n${parsed.data.content}`,
      "You are a prompt optimization assistant. Return only the optimized prompt.",
    )

    return { success: true, optimized: text.trim() }
  } catch (err) {
    console.error("optimizePrompt error:", err)
    return { success: false, error: "Failed to optimize prompt. Please try again." }
  }
}

export async function explainCode(data: ExplainCodeData): Promise<ExplainCodeResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const guard = await withAiGuard(rateLimiters.explainCode, auth.data.user.id, auth.data.user.isPro)
  if (!guard.success) return guard

  const parsed = validateInput(explainCodeSchema, data)
  if (!parsed.success) return parsed

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

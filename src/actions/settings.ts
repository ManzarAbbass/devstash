"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, validateInput, withVoidHandling } from "@/actions/shared"
import type { VoidResult } from "@/types/actions"

const editorPreferencesSchema = z.object({
  fontSize: z.number().min(8).max(32),
  tabSize: z.number().min(1).max(8),
  wordWrap: z.enum(["on", "off"]),
  minimap: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
})

export type EditorPreferencesInput = z.infer<typeof editorPreferencesSchema>

export type UpdateEditorPreferencesResult = VoidResult

export async function updateEditorPreferences(
  data: EditorPreferencesInput
): Promise<UpdateEditorPreferencesResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const parsed = validateInput(editorPreferencesSchema, data)
  if (!parsed.success) return parsed

  return withVoidHandling(
    () => prisma.user.update({
      where: { id: auth.data.user.id },
      data: { editorPreferences: parsed.data },
    }),
    "Failed to update preferences"
  )
}

"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const editorPreferencesSchema = z.object({
  fontSize: z.number().min(8).max(32),
  tabSize: z.number().min(1).max(8),
  wordWrap: z.enum(["on", "off"]),
  minimap: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
})

export type EditorPreferencesInput = z.infer<typeof editorPreferencesSchema>

export type UpdateEditorPreferencesResult =
  | { success: true }
  | { success: false; error: string }

export async function updateEditorPreferences(
  data: EditorPreferencesInput
): Promise<UpdateEditorPreferencesResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = editorPreferencesSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { editorPreferences: parsed.data },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update preferences" }
  }
}

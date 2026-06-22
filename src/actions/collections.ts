"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { createCollection as createCollectionQuery } from "@/lib/db/collections"

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500, "Description must be under 500 characters").nullable().optional(),
})

export type CreateCollectionData = z.infer<typeof createCollectionSchema>

export type CreateCollectionResult =
  | { success: true; data: { id: string; name: string; description: string | null; createdAt: Date } }
  | { success: false; error: Record<string, string[]> | string }

export async function createCollection(
  data: CreateCollectionData
): Promise<CreateCollectionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = createCollectionSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (!fieldErrors[key]) fieldErrors[key] = []
      fieldErrors[key].push(issue.message)
    }
    return { success: false, error: fieldErrors }
  }

  const { name, description } = parsed.data

  try {
    const created = await createCollectionQuery(session.user.id, {
      name,
      description: description ?? null,
    })
    return {
      success: true,
      data: {
        id: created.id,
        name: created.name,
        description: created.description,
        createdAt: created.createdAt,
      },
    }
  } catch {
    return { success: false, error: "Failed to create collection" }
  }
}

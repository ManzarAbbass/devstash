"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { getUserCollections as getUserCollectionsQuery, createCollection as createCollectionQuery, updateCollection as updateCollectionQuery, deleteCollection as deleteCollectionQuery, toggleCollectionFavorite as toggleCollectionFavoriteQuery } from "@/lib/db/collections"

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500, "Description must be under 500 characters").nullable().optional(),
})

export type CreateCollectionData = z.infer<typeof createCollectionSchema>

export type CreateCollectionResult =
  | { success: true; data: { id: string; name: string; description: string | null; createdAt: Date } }
  | { success: false; error: Record<string, string[]> | string }

export async function getUserCollections() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }
  return getUserCollectionsQuery(session.user.id)
}

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

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500, "Description must be under 500 characters").nullable().optional(),
})

export type UpdateCollectionData = z.infer<typeof updateCollectionSchema>

export type UpdateCollectionResult =
  | { success: true; data: { id: string; name: string; description: string | null; createdAt: Date } }
  | { success: false; error: Record<string, string[]> | string }

export async function updateCollection(
  collectionId: string,
  data: UpdateCollectionData
): Promise<UpdateCollectionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = updateCollectionSchema.safeParse(data)
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
    const updated = await updateCollectionQuery(session.user.id, collectionId, {
      name,
      description: description ?? null,
    })
    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        createdAt: updated.createdAt,
      },
    }
  } catch {
    return { success: false, error: "Failed to update collection" }
  }
}

export type DeleteCollectionResult =
  | { success: true }
  | { success: false; error: string }

export type ToggleFavoriteResult =
  | { success: true; data: { id: string; name: string; isFavorite: boolean } }
  | { success: false; error: string }

export async function toggleCollectionFavorite(collectionId: string): Promise<ToggleFavoriteResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const updated = await toggleCollectionFavoriteQuery(session.user.id, collectionId)
    return { success: true, data: { id: updated.id, name: updated.name, isFavorite: updated.isFavorite } }
  } catch {
    return { success: false, error: "Failed to toggle favorite" }
  }
}

export async function deleteCollection(
  collectionId: string
): Promise<DeleteCollectionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await deleteCollectionQuery(session.user.id, collectionId)
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete collection" }
  }
}

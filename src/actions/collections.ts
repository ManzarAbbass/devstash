"use server"

import { z } from "zod"
import { getUserCollections as getUserCollectionsQuery, createCollection as createCollectionQuery, updateCollection as updateCollectionQuery, deleteCollection as deleteCollectionQuery, toggleCollectionFavorite as toggleCollectionFavoriteQuery } from "@/lib/db/collections"
import { checkCollectionLimit } from "@/lib/pro"
import { requireAuth, parseFormData, withErrorHandling, withVoidHandling } from "@/actions/shared"
import type { DataResult, FieldResult, VoidResult } from "@/types/actions"

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500, "Description must be under 500 characters").nullable().optional(),
})

export type CreateCollectionData = z.infer<typeof createCollectionSchema>

type CollectionData = { id: string; name: string; description: string | null; createdAt: Date }

export type CreateCollectionResult = FieldResult<CollectionData>

export async function getUserCollections() {
  const auth = await requireAuth()
  if (!auth.success) return []
  return getUserCollectionsQuery(auth.data.user.id)
}

export async function createCollection(
  data: CreateCollectionData
): Promise<CreateCollectionResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const parsed = parseFormData(createCollectionSchema, data)
  if (!parsed.success) return parsed

  const { name, description } = parsed.data

  const limitCheck = await checkCollectionLimit(auth.data.user.id, auth.data.user.isPro)
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  return withErrorHandling(
    () => createCollectionQuery(auth.data.user.id, {
      name,
      description: description ?? null,
    }),
    "Failed to create collection"
  )
}

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500, "Description must be under 500 characters").nullable().optional(),
})

export type UpdateCollectionData = z.infer<typeof updateCollectionSchema>

export type UpdateCollectionResult = FieldResult<CollectionData>

export async function updateCollection(
  collectionId: string,
  data: UpdateCollectionData
): Promise<UpdateCollectionResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const parsed = parseFormData(updateCollectionSchema, data)
  if (!parsed.success) return parsed

  const { name, description } = parsed.data

  return withErrorHandling(
    () => updateCollectionQuery(auth.data.user.id, collectionId, {
      name,
      description: description ?? null,
    }),
    "Failed to update collection"
  )
}

export type DeleteCollectionResult = VoidResult

export type ToggleFavoriteResult = DataResult<{ id: string; name: string; isFavorite: boolean }>

export async function toggleCollectionFavorite(collectionId: string): Promise<ToggleFavoriteResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  return withErrorHandling(
    () => toggleCollectionFavoriteQuery(auth.data.user.id, collectionId),
    "Failed to toggle favorite"
  )
}

export async function deleteCollection(
  collectionId: string
): Promise<DeleteCollectionResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  return withVoidHandling(
    () => deleteCollectionQuery(auth.data.user.id, collectionId),
    "Failed to delete collection"
  )
}

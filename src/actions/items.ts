"use server"

import { z } from "zod"
import {
  createItem as createItemQuery,
  updateItem as updateItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  toggleItemPin as toggleItemPinQuery,
} from "@/lib/db/items"
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase"
import { checkItemLimit } from "@/lib/pro"
import { requireAuth, parseFormData, withErrorHandling, withVoidHandling } from "@/actions/shared"
import type { DataResult, FieldResult, VoidResult } from "@/types/actions"

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.union([z.string().url("Invalid URL"), z.null()]).optional(),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()).optional(),
})

export type UpdateItemData = z.infer<typeof updateItemSchema>

export type UpdateItemResult = FieldResult<import("@/lib/db/items").ItemWithDetails>

export async function updateItem(
  itemId: string,
  data: UpdateItemData
): Promise<UpdateItemResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const parsed = parseFormData(updateItemSchema, data)
  if (!parsed.success) return parsed

  const { title, tags, description, content, url, language, collectionIds } = parsed.data

  return withErrorHandling(
    () => updateItemQuery(auth.data.user.id, itemId, {
      title,
      tags,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      collectionIds,
    }),
    "Failed to update item"
  )
}

export type DeleteItemResult = VoidResult

const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  contentType: z.string().min(1, "Type is required"),
  itemTypeId: z.string().min(1, "Type is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.union([z.string().url("Invalid URL"), z.null()]).optional(),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  collectionIds: z.array(z.string()).optional(),
})

export type CreateItemData = z.infer<typeof createItemSchema>

export type CreateItemResult = FieldResult<import("@/lib/db/items").ItemWithDetails>

export async function createItem(
  data: CreateItemData
): Promise<CreateItemResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const parsed = parseFormData(createItemSchema, data)
  if (!parsed.success) return parsed

  const { title, contentType, itemTypeId, tags, description, content, url, language, fileUrl, fileName, fileSize, collectionIds } = parsed.data

  if (contentType === "link" && !url) {
    return { success: false, error: { url: ["URL is required for link type"] } }
  }

  const limitCheck = await checkItemLimit(auth.data.user.id, auth.data.user.isPro)
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  return withErrorHandling(
    () => createItemQuery(auth.data.user.id, {
      title,
      contentType,
      itemTypeId,
      tags,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      collectionIds,
    }),
    "Failed to create item"
  )
}

export async function deleteItem(
  itemId: string
): Promise<DeleteItemResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  try {
    const { fileUrl } = await deleteItemQuery(auth.data.user.id, itemId)

    if (fileUrl) {
      const key = extractStorageKey(fileUrl)
      if (key) {
        await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([key])
      }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete item" }
  }
}

export type ToggleFavoriteResult = DataResult<import("@/lib/db/items").ItemWithDetails>

export async function toggleItemFavorite(itemId: string): Promise<ToggleFavoriteResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  return withErrorHandling(
    () => toggleItemFavoriteQuery(auth.data.user.id, itemId),
    "Failed to toggle favorite"
  )
}

export type TogglePinResult = DataResult<import("@/lib/db/items").ItemWithDetails>

export async function toggleItemPin(itemId: string): Promise<TogglePinResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  return withErrorHandling(
    () => toggleItemPinQuery(auth.data.user.id, itemId),
    "Failed to toggle pin"
  )
}

function extractStorageKey(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const bucketIndex = url.pathname.indexOf(`/${STORAGE_BUCKET}/`)
    if (bucketIndex === -1) return null
    return url.pathname.slice(bucketIndex + `/${STORAGE_BUCKET}/`.length)
  } catch {
    return null
  }
}

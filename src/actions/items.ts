"use server"

import { z } from "zod"
import { auth } from "@/auth"
import {
  createItem as createItemQuery,
  updateItem as updateItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  toggleItemPin as toggleItemPinQuery,
} from "@/lib/db/items"
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase"
import { checkItemLimit } from "@/lib/pro"

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

export type UpdateItemResult =
  | { success: true; data: import("@/lib/db/items").ItemWithDetails }
  | { success: false; error: Record<string, string[]> | string }

export async function updateItem(
  itemId: string,
  data: UpdateItemData
): Promise<UpdateItemResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = updateItemSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (!fieldErrors[key]) fieldErrors[key] = []
      fieldErrors[key].push(issue.message)
    }
    return { success: false, error: fieldErrors }
  }

  const { title, tags, description, content, url, language, collectionIds } = parsed.data

  try {
    const updated = await updateItemQuery(session.user.id, itemId, {
      title,
      tags,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      collectionIds,
    })
    return { success: true, data: updated }
  } catch {
    return { success: false, error: "Failed to update item" }
  }
}

export type DeleteItemResult =
  | { success: true }
  | { success: false; error: string }

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

export type CreateItemResult =
  | { success: true; data: import("@/lib/db/items").ItemWithDetails }
  | { success: false; error: Record<string, string[]> | string }

export async function createItem(
  data: CreateItemData
): Promise<CreateItemResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = createItemSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (!fieldErrors[key]) fieldErrors[key] = []
      fieldErrors[key].push(issue.message)
    }
    return { success: false, error: fieldErrors }
  }

  const { title, contentType, itemTypeId, tags, description, content, url, language, fileUrl, fileName, fileSize, collectionIds } = parsed.data

  if (contentType === "link" && !url) {
    return { success: false, error: { url: ["URL is required for link type"] } }
  }

  const limitCheck = await checkItemLimit(session.user.id, session.user.isPro)
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  try {
    const created = await createItemQuery(session.user.id, {
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
    })
    return { success: true, data: created }
  } catch {
    return { success: false, error: "Failed to create item" }
  }
}

export async function deleteItem(
  itemId: string
): Promise<DeleteItemResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const { fileUrl } = await deleteItemQuery(session.user.id, itemId)

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

export type ToggleFavoriteResult =
  | { success: true; data: import("@/lib/db/items").ItemWithDetails }
  | { success: false; error: string }

export async function toggleItemFavorite(itemId: string): Promise<ToggleFavoriteResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const updated = await toggleItemFavoriteQuery(session.user.id, itemId)
    return { success: true, data: updated }
  } catch {
    return { success: false, error: "Failed to toggle favorite" }
  }
}

export type TogglePinResult =
  | { success: true; data: import("@/lib/db/items").ItemWithDetails }
  | { success: false; error: string }

export async function toggleItemPin(itemId: string): Promise<TogglePinResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const updated = await toggleItemPinQuery(session.user.id, itemId)
    return { success: true, data: updated }
  } catch {
    return { success: false, error: "Failed to toggle pin" }
  }
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

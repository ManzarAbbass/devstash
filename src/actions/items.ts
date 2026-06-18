"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { updateItem as updateItemQuery, deleteItem as deleteItemQuery } from "@/lib/db/items"

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.union([z.string().url("Invalid URL"), z.null()]).optional(),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
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

  const { title, tags, description, content, url, language } = parsed.data

  try {
    const updated = await updateItemQuery(session.user.id, itemId, {
      title,
      tags,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
    })
    return { success: true, data: updated }
  } catch {
    return { success: false, error: "Failed to update item" }
  }
}

export type DeleteItemResult =
  | { success: true }
  | { success: false; error: string }

export async function deleteItem(
  itemId: string
): Promise<DeleteItemResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await deleteItemQuery(session.user.id, itemId)
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete item" }
  }
}

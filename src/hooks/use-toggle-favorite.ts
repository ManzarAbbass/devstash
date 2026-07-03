"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { toggleItemFavorite } from "@/actions/items"
import { toggleCollectionFavorite } from "@/actions/collections"

export function useToggleFavorite(entityType: "item" | "collection", id: string, initialValue = false) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialValue)

  async function handleToggleFavorite() {
    const newState = !isFavorite
    setIsFavorite(newState)

    const result = entityType === "item"
      ? await toggleItemFavorite(id)
      : await toggleCollectionFavorite(id)

    if (!result.success) {
      setIsFavorite(!newState)
      toast.error(result.error)
      return
    }

    toast.success(newState ? "Added to favorites" : "Removed from favorites")
    router.refresh()
  }

  return { isFavorite, handleToggleFavorite }
}

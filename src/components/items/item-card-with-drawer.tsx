"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ItemCard } from "./item-card"
import { ItemDrawer } from "./item-drawer"
import { toggleItemFavorite } from "@/actions/items"
import type { ItemWithDetails } from "@/lib/db/items"

const contentTypesWithFile = ["file", "image"]

export function ItemCardWithDrawer({ item, compact, isPro }: { item: ItemWithDetails; compact?: boolean; isPro?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isLocked = contentTypesWithFile.includes(item.itemType.name.toLowerCase()) && !isPro

  function handleToggleFavorite() {
    startTransition(async () => {
      const result = await toggleItemFavorite(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleClick() {
    if (isLocked) return
    setOpen(true)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div onClick={handleClick} className="contents">
        <ItemCard item={item} compact={compact} onToggleFavorite={handleToggleFavorite} isPro={isPro} />
      </div>
      <SheetContent side="right" className="w-3/4 sm:max-w-6xl">
        <ItemDrawer itemId={item.id} />
      </SheetContent>
    </Sheet>
  )
}

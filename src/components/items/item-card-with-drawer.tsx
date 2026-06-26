"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ItemCard } from "./item-card"
import { ItemDrawer } from "./item-drawer"
import { toggleItemFavorite } from "@/actions/items"
import type { ItemWithDetails } from "@/lib/db/items"

export function ItemCardWithDrawer({ item, compact }: { item: ItemWithDetails; compact?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="contents">
        <ItemCard item={item} compact={compact} onToggleFavorite={handleToggleFavorite} />
      </div>
      <SheetContent side="right" className="w-3/4 sm:max-w-6xl">
        <ItemDrawer itemId={item.id} />
      </SheetContent>
    </Sheet>
  )
}

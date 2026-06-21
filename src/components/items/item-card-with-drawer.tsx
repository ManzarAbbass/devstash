"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ItemCard } from "./item-card"
import { ItemDrawer } from "./item-drawer"
import type { ItemWithDetails } from "@/lib/db/items"

export function ItemCardWithDrawer({ item, compact }: { item: ItemWithDetails; compact?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="contents">
        <ItemCard item={item} compact={compact} />
      </div>
      <SheetContent side="right" className="w-3/4 sm:max-w-6xl">
        <ItemDrawer itemId={item.id} />
      </SheetContent>
    </Sheet>
  )
}

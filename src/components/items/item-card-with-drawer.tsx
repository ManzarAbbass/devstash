"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ItemCard } from "./item-card"
import { ItemDrawer } from "./item-drawer"
import type { ItemWithDetails } from "@/lib/db/items"

export function ItemCardWithDrawer({ item }: { item: ItemWithDetails }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="contents">
        <ItemCard item={item} />
      </div>
      <SheetContent side="right" className="w-3/4 sm:max-w-lg">
        <ItemDrawer itemId={item.id} />
      </SheetContent>
    </Sheet>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FolderClosed, Star } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ItemDrawer } from "@/components/items/item-drawer"
import { Badge } from "@/components/ui/badge"
import { iconMap } from "@/lib/icons"
import type { ItemWithDetails } from "@/lib/db/items"
import type { CollectionDetails } from "@/lib/db/collections"

interface FavoritesListProps {
  items: ItemWithDetails[]
  collections: CollectionDetails[]
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ItemRow({ item }: { item: ItemWithDetails }) {
  const [open, setOpen] = useState(false)
  const Icon = iconMap[item.itemType.icon]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-3 py-1.5 text-left font-mono text-sm transition-colors hover:bg-muted/50"
      >
        <div className="flex size-4 shrink-0 items-center justify-center">
          {Icon ? <Icon className="size-3.5" style={{ color: item.itemType.color }} /> : <Star className="size-3.5 text-muted-foreground" />}
        </div>
        <span className="flex-1 truncate">{item.title}</span>
        <Badge variant="outline" className="shrink-0 text-[10px] leading-none px-1.5 py-0 h-4 font-mono">
          {item.contentType}
        </Badge>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDate(item.updatedAt)}</span>
      </button>
      <SheetContent side="right" className="w-3/4 sm:max-w-6xl">
        <ItemDrawer itemId={item.id} />
      </SheetContent>
    </Sheet>
  )
}

function CollectionRow({ collection }: { collection: CollectionDetails }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex w-full items-center gap-3 px-3 py-1.5 font-mono text-sm transition-colors hover:bg-muted/50"
    >
      <div className="flex size-4 shrink-0 items-center justify-center">
        <FolderClosed className="size-3.5 text-muted-foreground" />
      </div>
      <span className="flex-1 truncate">{collection.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDate(collection.createdAt)}</span>
    </Link>
  )
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {items.length > 0 && (
        <div>
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
            <Star className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-xs font-medium text-muted-foreground">
              Items ({items.length})
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {collections.length > 0 && (
        <div>
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
            <Star className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-xs font-medium text-muted-foreground">
              Collections ({collections.length})
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {collections.map((collection) => (
              <CollectionRow key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

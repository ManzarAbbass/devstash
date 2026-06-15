import Link from "next/link"
import {
  Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link2,
  Star,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ItemWithDetails } from "@/lib/db/items"

const iconMap: Record<string, typeof Code2> = {
  Code: Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function ItemCard({ item }: { item: ItemWithDetails }) {
  const Icon = iconMap[item.itemType.icon] || Code2

  return (
    <Link
      href={`/items/${item.itemType.name}/${item.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md"
      style={{ borderLeftWidth: "4px", borderLeftColor: item.itemType.color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="size-4 shrink-0" style={{ color: item.itemType.color }} />
          <span className="truncate text-sm font-medium">{item.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.isFavorite && <Star className="size-3.5 fill-yellow-500 text-yellow-500" />}
          <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
        </div>
      </div>
      {item.description && (
        <span className="text-sm text-muted-foreground line-clamp-2">{item.description}</span>
      )}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  )
}

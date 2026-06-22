import Link from "next/link"
import { Code2, Star } from "lucide-react"

import { iconMap } from "@/lib/icons"
import type { CollectionWithStats } from "@/lib/db/collections"

export function CollectionCard({ collection }: { collection: CollectionWithStats }) {
  const borderColor = collection.dominantType?.color ?? "var(--border)"

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
      style={{ borderLeftWidth: "4px", borderLeftColor: borderColor }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{collection.name}</span>
        {collection.isFavorite && <Star className="size-4 fill-yellow-500 text-yellow-500" />}
      </div>
      <span className="text-sm text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </span>
      {collection.description && (
        <span className="text-sm text-muted-foreground line-clamp-2">{collection.description}</span>
      )}
      {collection.typeIcons.length > 0 && (
        <div className="mt-1 flex items-center gap-1.5">
          {collection.typeIcons.map((type) => {
            const TypeIcon = iconMap[type.icon] || Code2
            return (
              <span key={type.name} title={type.name}>
                <TypeIcon className="size-3.5" style={{ color: type.color }} />
              </span>
            )
          })}
        </div>
      )}
    </Link>
  )
}

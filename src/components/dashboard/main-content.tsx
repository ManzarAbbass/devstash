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
  Pin,
  Layers,
  Bookmark,
  Heart,
  Archive,
  MoreHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { collections, items, itemTypes, itemCollections, tags as tagData } from "@/lib/mock-data"

const iconMap: Record<string, typeof Code2> = {
  Code: Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

const typeLookup: Record<string, (typeof itemTypes)[0]> = {}
for (const t of itemTypes) {
  typeLookup[t.id] = t
}

const tagLookup: Record<string, string> = {}
for (const t of tagData) {
  tagLookup[t.id] = t.name
}

const collectionItemCounts: Record<string, number> = {}
for (const ic of itemCollections) {
  collectionItemCounts[ic.collectionId] = (collectionItemCounts[ic.collectionId] || 0) + 1
}

const sortedCollections = [...collections].sort(
  (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
)

const pinnedItems = items.filter((i) => i.isPinned)

const recentItems = [...items].sort(
  (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
).slice(0, 10)

const borderColors = [
  "border-l-blue-500",
  "border-l-yellow-500",
  "border-l-orange-500",
  "border-l-purple-500",
  "border-l-emerald-500",
  "border-l-pink-500",
  "border-l-cyan-500",
  "border-l-red-500",
]

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function MainContent() {
  const totalItems = items.length
  const totalCollections = collections.length
  const favoriteItems = items.filter((i) => i.isFavorite).length
  const favoriteCollections = collections.filter((c) => c.isFavorite).length

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Layers} label="Total Items" value={totalItems} />
        <StatCard icon={Archive} label="Collections" value={totalCollections} />
        <StatCard icon={Heart} label="Favorite Items" value={favoriteItems} />
        <StatCard icon={Star} label="Favorite Collections" value={favoriteCollections} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Collections</h2>
          <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCollections.map((col, i) => {
            const count = collectionItemCounts[col.id] || 0
            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className={`group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 border-l-4 ${borderColors[i % borderColors.length]} transition-colors hover:bg-muted/50`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{col.name}</span>
                  {col.isFavorite && <Star className="size-4 fill-yellow-500 text-yellow-500" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "item" : "items"}
                </span>
                {col.description && (
                  <span className="text-sm text-muted-foreground line-clamp-2">
                    {col.description}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned Items</h2>
          </div>
          <div className="flex flex-col">
            {pinnedItems.map((item) => {
              const type = typeLookup[item.itemTypeId]
              const Icon = type ? iconMap[type.icon] || Code2 : Code2
              const itemTags = item.tagIds.map((tid) => tagLookup[tid]).filter(Boolean)
              return (
                <Link
                  key={item.id}
                  href={`/items/${type?.name ?? "unknown"}/${item.id}`}
                  className="group flex items-center gap-3 border-l-4 border-l-transparent border-b border-border px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <Icon className="size-4 shrink-0" style={{ color: type?.color }} />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm font-medium">{item.title}</span>
                    {item.isFavorite && <Star className="size-3 shrink-0 fill-yellow-500 text-yellow-500" />}
                  </div>
                  {item.description && (
                    <span className="hidden max-w-xs truncate text-sm text-muted-foreground md:block">
                      {item.description}
                    </span>
                  )}
                  <div className="hidden items-center gap-1 lg:flex">
                    {itemTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
        <div className="flex flex-col">
          {recentItems.map((item) => {
            const type = typeLookup[item.itemTypeId]
            const Icon = type ? iconMap[type.icon] || Code2 : Code2
            const itemTags = item.tagIds.map((tid) => tagLookup[tid]).filter(Boolean)
            return (
              <Link
                key={item.id}
                href={`/items/${type?.name ?? "unknown"}/${item.id}`}
                className="group flex items-center gap-3 border-l-4 border-l-transparent border-b border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <Icon className="size-4 shrink-0" style={{ color: type?.color }} />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm font-medium">{item.title}</span>
                  {item.isFavorite && <Star className="size-3 shrink-0 fill-yellow-500 text-yellow-500" />}
                </div>
                {item.description && (
                  <span className="hidden max-w-xs truncate text-sm text-muted-foreground md:block">
                    {item.description}
                  </span>
                )}
                <div className="hidden items-center gap-1 lg:flex">
                  {itemTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

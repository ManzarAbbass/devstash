import Link from "next/link"
import {
  Code2,
  Star,
  Pin,
  Layers,
  Heart,
  Archive,
} from "lucide-react"

import { iconMap } from "@/lib/icons"
import { getCollections, type CollectionWithStats } from "@/lib/db/collections"
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items"
import { ItemCardWithDrawer } from "@/components/items/item-card-with-drawer"

export async function MainContent({ userId }: { userId: string }) {
  const [collections, pinnedItems, recentItems, { totalItems, favoriteItems }] = await Promise.all([
    getCollections(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
    getItemStats(userId),
  ])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Layers} label="Total Items" value={totalItems} />
        <StatCard icon={Archive} label="Collections" value={collections.length} />
        <StatCard icon={Heart} label="Favorite Items" value={favoriteItems} />
        <StatCard icon={Star} label="Favorite Collections" value={collections.filter((c) => c.isFavorite).length} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Collections</h2>
          <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned Items</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedItems.map((item) => (
              <ItemCardWithDrawer key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentItems.map((item) => (
            <ItemCardWithDrawer key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: number }) {
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

function CollectionCard({ collection }: { collection: CollectionWithStats }) {
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



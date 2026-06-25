import { redirect } from "next/navigation"
import { Star } from "lucide-react"

import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getFavoriteItems } from "@/lib/db/items"
import { getFavoriteCollections } from "@/lib/db/collections"
import { FavoritesList } from "@/components/favorites/favorites-list"

export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, searchData, favoriteItems, favoriteCollections] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ])

  const hasFavorites = favoriteItems.length > 0 || favoriteCollections.length > 0

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Favorites</h1>
        {!hasFavorites ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Star className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No favorites yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Star items and collections to see them here.
            </p>
          </div>
        ) : (
          <FavoritesList items={favoriteItems} collections={favoriteCollections} />
        )}
      </div>
    </DashboardLayout>
  )
}

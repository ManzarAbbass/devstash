import { redirect, notFound } from "next/navigation"
import { PackageOpen } from "lucide-react"

import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData, getItemsByCollection } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getCollections } from "@/lib/db/collections"
import { ItemCardWithDrawer } from "@/components/items/item-card-with-drawer"
import { CollectionDetailHeader } from "@/components/collections/collection-detail-header"

export const dynamic = "force-dynamic"

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, searchData, collections, items] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getCollections(userId),
    getItemsByCollection(userId, id),
  ])

  const collection = collections.find((c) => c.id === id)
  if (!collection) notFound()

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <div className="flex flex-col gap-6">
        <CollectionDetailHeader
          collection={{ id: collection.id, name: collection.name, description: collection.description, isFavorite: collection.isFavorite }}
          itemCount={items.length}
        />
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <PackageOpen className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Collection is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add items to this collection to see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCardWithDrawer key={item.id} item={item} compact />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

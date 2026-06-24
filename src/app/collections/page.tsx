import { redirect } from "next/navigation"
import { FolderClosed } from "lucide-react"

import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getCollections } from "@/lib/db/collections"
import { CollectionCard } from "@/components/collections/collection-card"

export const dynamic = "force-dynamic"

export default async function CollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, searchData, collections] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getCollections(userId),
  ])

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <FolderClosed className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No collections yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first collection to organize your items.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

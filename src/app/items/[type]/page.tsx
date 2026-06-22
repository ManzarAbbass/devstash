import { redirect } from "next/navigation"
import {
  Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link2,
} from "lucide-react"

import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData, getItemsByType } from "@/lib/db/items"
import { ItemCardWithDrawer } from "@/components/items/item-card-with-drawer"
import { AddItemButton } from "@/components/items/add-item-button"

export const dynamic = "force-dynamic"

const typeIcons: Record<string, typeof Code2> = {
  snippet: Code2,
  prompt: Sparkles,
  command: Terminal,
  note: StickyNote,
  file: File,
  image: Image,
  link: Link2,
}

export default async function ItemsListPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const typeName = type.endsWith("s") ? type.slice(0, -1) : type

  const [sidebarData, items] = await Promise.all([
    getSidebarData(userId),
    getItemsByType(userId, typeName),
  ])

  const displayName = typeName.charAt(0).toUpperCase() + typeName.slice(1)
  const TypeIcon = typeIcons[typeName] || Code2

  return (
    <DashboardLayout sidebarData={sidebarData}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{displayName}s</h1>
            <p className="text-xs text-muted-foreground">Items: {items.length}</p>
          </div>
          <AddItemButton type={typeName} />
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <TypeIcon className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No {typeName}s yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first {typeName} to see it here.
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

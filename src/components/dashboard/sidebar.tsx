"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { PanelLeft } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { SidebarItemTypes } from "@/components/dashboard/sidebar-item-types"
import { SidebarCollections } from "@/components/dashboard/sidebar-collections"
import { SidebarUserMenu } from "@/components/dashboard/sidebar-user-menu"
import type { SidebarData } from "@/lib/db/items"

export function Sidebar({ data }: { data: SidebarData }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`shrink-0 border-r border-border transition-[width] duration-200 ${collapsed ? "w-14" : "w-60"}`}
    >
      <SidebarContent data={data} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
    </aside>
  )
}

export function SidebarContent({
  data,
  collapsed,
  onToggle,
}: {
  data: SidebarData
  collapsed: boolean
  onToggle?: () => void
}) {
  const { data: session } = useSession()
  const isPro = session?.user?.isPro ?? false
  const { user, itemTypes, favoriteCollections, recentCollections } = data

  const linkClass =
    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
  const iconOnlyClass =
    "flex items-center justify-center rounded-md p-2 text-sm transition-colors hover:bg-muted"

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center px-3 pt-3 pb-1">
        {!collapsed && (
          <span className="text-xs font-medium text-muted-foreground">Navigation</span>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="ml-auto flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="size-4" />
          </button>
        )}
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarItemTypes itemTypes={itemTypes} collapsed={collapsed} isPro={isPro} linkClass={linkClass} iconOnlyClass={iconOnlyClass} />
        <Separator />
        <SidebarCollections favoriteCollections={favoriteCollections} recentCollections={recentCollections} collapsed={collapsed} linkClass={linkClass} iconOnlyClass={iconOnlyClass} />
      </div>

      <div className="mt-auto" />
      <Separator />
      <SidebarUserMenu user={user} collapsed={collapsed} />
    </div>
  )
}

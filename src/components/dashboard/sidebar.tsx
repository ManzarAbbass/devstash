"use client"

import { useState } from "react"
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
  ChevronDown,
  Settings,
  FolderIcon,
  PanelLeft,
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { currentUser, itemTypes, collections, items } from "@/lib/mock-data"

const iconMap: Record<string, typeof Code2> = {
  Code: Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

const typeCounts: Record<string, number> = {}
for (const item of items) {
  typeCounts[item.itemTypeId] = (typeCounts[item.itemTypeId] || 0) + 1
}

const favoriteCollections = collections.filter((c) => c.isFavorite)

const recentCollections = [...collections]
  .filter((c) => !c.isFavorite)
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

const initials = currentUser.name
  .split(" ")
  .map((n) => n[0])
  .join("")

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`shrink-0 border-r border-border transition-[width] duration-200 ${collapsed ? "w-14" : "w-60"}`}
    >
      <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
    </aside>
  )
}

export function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle?: () => void
}) {
  const [collectionsOpen, setCollectionsOpen] = useState(true)

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

      <div className="flex flex-col gap-1 px-2 py-2">
        {!collapsed && (
          <button
            type="button"
            className="flex items-center gap-1 px-1 py-1 text-xs font-medium text-muted-foreground"
          >
            <ChevronDown className="size-3" />
            Types
          </button>
        )}
        <nav className="flex flex-col gap-0.5">
          {itemTypes.map((type) => {
            const Icon = iconMap[type.icon] || Code2
            const count = typeCounts[type.id] || 0
            return collapsed ? (
              <Link
                key={type.id}
                href={`/items/${type.name}s`}
                className={iconOnlyClass}
                title={`${type.name}s`}
              >
                <Icon className="size-4" style={{ color: type.color }} />
              </Link>
            ) : (
              <Link
                key={type.id}
                href={`/items/${type.name}s`}
                className={linkClass}
              >
                <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                <span className="flex-1 capitalize">{type.name}s</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <Separator />

      <div className="flex flex-col gap-1 px-2 py-2">
        {collapsed ? (
          <Link
            href="/collections"
            className={iconOnlyClass}
            title="Favorites"
          >
            <Star className="size-4 fill-current text-yellow-500" />
          </Link>
        ) : (
          <>
            <span className="flex items-center gap-1 px-1 py-1 text-xs font-medium text-muted-foreground">
              <Star className="size-3 fill-current" />
              Favorites
            </span>
            <nav className="flex flex-col gap-0.5">
              {favoriteCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className={linkClass}
                >
                  <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                  <span>{col.name}</span>
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-1 px-2 py-2">
        {collapsed ? (
          <Link
            href="/collections"
            className={iconOnlyClass}
            title="All Collections"
          >
            <FolderIcon className="size-4" />
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setCollectionsOpen((v) => !v)}
              className="flex items-center gap-1 px-1 py-1 text-xs font-medium text-muted-foreground"
            >
              <ChevronDown
                className={`size-3 transition-transform ${collectionsOpen ? "" : "-rotate-90"}`}
              />
              All Collections
            </button>
            {collectionsOpen && (
              <nav className="flex flex-col gap-0.5">
                {recentCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className={linkClass}
                  >
                    <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                    <span>{col.name}</span>
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}
      </div>

      <div className="mt-auto" />

      <Separator />

      {collapsed ? (
        <div className="flex justify-center px-2 py-3">
          <Avatar size="sm">
            <AvatarImage src={currentUser.image} alt={currentUser.name} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar size="sm">
            <AvatarImage src={currentUser.image} alt={currentUser.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{currentUser.name}</span>
            <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
          </div>
          <button
            type="button"
            aria-label="Settings"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Settings className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

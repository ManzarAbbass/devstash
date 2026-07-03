"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Star, FolderIcon } from "lucide-react"

import type { SidebarData } from "@/lib/db/items"

interface SidebarCollectionsProps {
  favoriteCollections: SidebarData["favoriteCollections"]
  recentCollections: SidebarData["recentCollections"]
  collapsed: boolean
  linkClass: string
  iconOnlyClass: string
}

export function SidebarCollections({ favoriteCollections, recentCollections, collapsed, linkClass, iconOnlyClass }: SidebarCollectionsProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 px-2 py-2">
        <Link href="/collections" className={iconOnlyClass} title="All Collections">
          <FolderIcon className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
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
        <div className="flex flex-col gap-1">
          {favoriteCollections.length > 0 && (
            <>
              <span className="flex items-center gap-1 px-1 pt-1 text-xs font-medium text-muted-foreground/60">
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
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: col.dominantTypeColor ?? "#6b7280" }} />
                    <span>{col.name}</span>
                  </Link>
                ))}
              </nav>
            </>
          )}
          <span className="flex items-center gap-1 px-1 pt-1 text-xs font-medium text-muted-foreground/60">
            Recent
          </span>
          <nav className="flex flex-col gap-0.5">
            {recentCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className={linkClass}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: col.dominantTypeColor ?? "#6b7280" }}
                />
                <span>{col.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
      <Link
        href="/collections"
        className="text-xs text-muted-foreground hover:text-foreground px-1"
      >
        View all collections
      </Link>
    </div>
  )
}

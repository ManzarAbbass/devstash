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
  Search,
  ChevronDown,
  Settings,
} from "lucide-react"

import { Input } from "@/components/ui/input"
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

export function SidebarContent() {
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
          D
        </div>
        <span className="text-base font-semibold">DevStash</span>
      </div>

      <div className="relative px-3 pb-2">
        <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search items..." className="pl-8 h-8 text-sm" />
      </div>

      <Separator />

      <div className="flex flex-col gap-1 px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-1 px-1 py-1 text-xs font-medium text-muted-foreground"
        >
          <ChevronDown className="size-3" />
          Types
        </button>
        <nav className="flex flex-col gap-0.5">
          {itemTypes.map((type) => {
            const Icon = iconMap[type.icon] || Code2
            const count = typeCounts[type.id] || 0
            return (
              <Link
                key={type.id}
                href={`/items/${type.name}s`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <Icon className="size-4" style={{ color: type.color }} />
                <span className="flex-1 capitalize">{type.name}s</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <Separator />

      <div className="flex flex-col gap-1 px-3 py-2">
        <span className="flex items-center gap-1 px-1 py-1 text-xs font-medium text-muted-foreground">
          <Star className="size-3 fill-current" />
          Favorites
        </span>
        <nav className="flex flex-col gap-0.5">
          {favoriteCollections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <span className="size-2 shrink-0 rounded-full bg-blue-500" />
              <span>{col.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <Separator />

      <div className="flex flex-col gap-1 px-3 py-2">
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
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                <span>{col.name}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="mt-auto" />

      <Separator />

      <div className="flex items-center gap-3 px-3 py-3">
        <Avatar size="sm">
          <AvatarImage src={currentUser.image} alt={currentUser.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{currentUser.name}</span>
          <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
        </div>
        <button type="button" aria-label="Settings" className="shrink-0 text-muted-foreground hover:text-foreground">
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  )
}

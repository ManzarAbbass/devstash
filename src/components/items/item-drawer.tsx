"use client"

import { useState, useEffect } from "react"
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { ItemWithDetails } from "@/lib/db/items"

const iconMap: Record<string, typeof Code2> = {
  Code: Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

function DrawerSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 p-4">
      <div className="h-6 w-2/3 rounded bg-muted" />
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="mt-2 h-8 w-full rounded bg-muted" />
      <div className="h-20 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
    </div>
  )
}

export function ItemDrawer({ itemId }: { itemId: string }) {
  const [item, setItem] = useState<ItemWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item")
        return res.json()
      })
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [itemId])

  if (loading) {
    return (
      <>
        <SheetHeader>
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        </SheetHeader>
        <DrawerSkeleton />
      </>
    )
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        {error || "Item not found"}
      </div>
    )
  }

  const Icon = iconMap[item.itemType.icon] || Code2

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-5 shrink-0" style={{ color: item.itemType.color }} />
          <SheetTitle className="truncate">{item.title}</SheetTitle>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {item.itemType.name}
          </Badge>
          {item.language && (
            <Badge variant="outline" className="text-[10px]">
              {item.language}
            </Badge>
          )}
        </div>
      </SheetHeader>

      <div className="flex items-center gap-0.5 px-4">
        <Button variant="ghost" size="icon-sm" aria-label="Favorite">
          <Star
            className={`size-4 ${item.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`}
          />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Pin">
          <Pin
            className={`size-4 ${item.isPinned ? "fill-sky-500 text-sky-500" : ""}`}
          />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Copy">
          <Copy className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Edit">
          <Pencil className="size-4" />
        </Button>
        <div className="ml-auto">
          <Button variant="ghost" size="icon-sm" aria-label="Delete" className="text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
        {item.description && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-relaxed">{item.description}</p>
          </div>
        )}

        {item.content && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </h3>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs leading-relaxed">
              {item.content}
            </pre>
          </div>
        )}

        {item.tags.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-[10px]">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Created{" "}
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {item.url && (
              <p className="truncate">
                URL:{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {item.url}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

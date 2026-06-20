"use client"

import {
  Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link2,
  Star,
  Download,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const contentTypesWithFile = ["file", "image"]

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function extractFileKey(publicUrl: string): string {
  const url = new URL(publicUrl)
  const segments = url.pathname.split("/")
  const storageIndex = segments.indexOf("devstash")
  return segments.slice(storageIndex + 1).join("/")
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleDownload(item: ItemWithDetails) {
  if (!item.fileUrl) return
  const url = `/api/download/${extractFileKey(item.fileUrl)}`
  const a = document.createElement("a")
  a.href = url
  a.download = item.fileName || "download"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function ItemCard({ item }: { item: ItemWithDetails }) {
  const Icon = iconMap[item.itemType.icon] || Code2
  const typeName = item.itemType.name.toLowerCase()

  if (contentTypesWithFile.includes(typeName)) {
    if (typeName === "image") {
      return (
        <div className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
          <div className="aspect-square overflow-hidden bg-muted">
            {item.fileUrl ? (
              <img
                src={item.fileUrl}
                alt={item.fileName ?? item.title}
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Image className="size-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-medium">{item.fileName || item.title}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="group flex cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md">
        <div className="flex w-full items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${item.itemType.color}18` }}
          >
            {item.fileUrl ? (
              <img
                src={item.fileUrl}
                alt={item.fileName ?? "Image"}
                className="size-14 rounded-xl object-cover"
              />
            ) : (
              <File className="size-7" style={{ color: item.itemType.color }} />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-medium">{item.fileName || item.title}</p>
            {item.fileSize != null && (
              <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
            )}
            {item.description && (
              <p className="text-xs text-muted-foreground/80 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Download"
              onClick={(e) => {
                e.stopPropagation()
                handleDownload(item)
              }}
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md"
      style={{ borderLeftWidth: "4px", borderLeftColor: item.itemType.color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="size-4 shrink-0" style={{ color: item.itemType.color }} />
          <span className="truncate text-sm font-medium">{item.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.isFavorite && <Star className="size-3.5 fill-yellow-500 text-yellow-500" />}
          <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
        </div>
      </div>
      {item.description && (
        <span className="text-sm text-muted-foreground line-clamp-2">{item.description}</span>
      )}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

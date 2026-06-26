"use client"

import {
  Code2,
  Copy,
  Pin,
  Star,
  Download,
  File,
  Image,
} from "lucide-react"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { iconMap } from "@/lib/icons"
import { extractFileKey, formatFileSize } from "@/lib/utils"
import type { ItemWithDetails } from "@/lib/db/items"

const contentTypesWithFile = ["file", "image"]

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
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

function getCopyContent(item: ItemWithDetails): string {
  if (item.content) return item.content
  if (item.itemType.name === "Link" && item.url) return item.url
  return item.title
}

function handleQuickCopy(item: ItemWithDetails) {
  const text = getCopyContent(item)
  navigator.clipboard.writeText(text)
  toast.success("Copied!")
}

export function ItemCard({ item, compact, onToggleFavorite }: { item: ItemWithDetails; compact?: boolean; onToggleFavorite?: () => void }) {
  const Icon = iconMap[item.itemType.icon] || Code2
  const typeName = item.itemType.name.toLowerCase()

  if (contentTypesWithFile.includes(typeName)) {
    if (typeName === "image" && !compact) {
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
          <button
            type="button"
            aria-label={item.isFavorite ? "Unfavorite" : "Favorite"}
            className="p-0.5 rounded hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite?.()
            }}
          >
            <Star className={`size-3.5 ${item.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
          </button>
          {item.isPinned && (
            <Pin className="size-3 text-sky-500" />
          )}
          <button
            type="button"
            aria-label="Copy"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation()
              handleQuickCopy(item)
            }}
          >
            <Copy className="size-3.5 text-muted-foreground" />
          </button>
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

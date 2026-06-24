"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { File, FolderClosed } from "lucide-react"

import { iconMap } from "@/lib/icons"
import type { SearchData } from "@/lib/db/search"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: SearchData
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

export function CommandPalette({ open, onOpenChange, data }: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  const handleSelectItem = useCallback(
    (itemTypeName: string) => {
      onOpenChange(false)
      router.push(`/items/${itemTypeName}s`)
    },
    [onOpenChange, router]
  )

  const handleSelectCollection = useCallback(
    (collectionId: string) => {
      onOpenChange(false)
      router.push(`/collections/${collectionId}`)
    },
    [onOpenChange, router]
  )

  if (!open) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onMouseDown={() => onOpenChange(false)}
      />
      <div className="fixed top-[15%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border bg-popover shadow-xl">
        <Command className="overflow-hidden rounded-xl">
          <div className="flex items-center border-b border-border px-3">
            <Command.Input
              placeholder="Search items and collections..."
              className="flex h-12 w-full bg-transparent text-sm outline-none ring-0 placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="scrollbar-none max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {data.items.length > 0 && (
              <Command.Group heading="Items">
                {data.items.map((item) => {
                  const Icon = iconMap[item.type.icon] || File
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.id + " " + item.title}
                      onSelect={() => handleSelectItem(item.type.name)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm cursor-pointer aria-selected:bg-muted hover:bg-muted"
                    >
                      <Icon className="size-4 shrink-0" style={{ color: item.type.color }} />
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium">{item.title}</span>
                        {item.contentPreview && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.contentPreview}
                          </span>
                        )}
                      </div>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}
            {data.collections.length > 0 && (
              <Command.Group heading="Collections">
                {data.collections.map((col) => (
                  <Command.Item
                    key={col.id}
                    value={col.id + " " + col.name}
                    onSelect={() => handleSelectCollection(col.id)}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm cursor-pointer aria-selected:bg-muted hover:bg-muted"
                  >
                    <FolderClosed className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="font-medium">{col.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </Portal>
  )
}

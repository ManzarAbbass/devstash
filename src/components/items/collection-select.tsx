"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Collection {
  id: string
  name: string
}

interface CollectionSelectProps {
  collections: Collection[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function CollectionSelect({
  collections,
  selectedIds,
  onChange,
  disabled,
}: CollectionSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(
    () =>
      collections.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [collections, search]
  )

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id]
    onChange(next)
  }

  const label =
    selectedIds.length === 0
      ? "Select collections"
      : `${selectedIds.length} collection${selectedIds.length === 1 ? "" : "s"}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm font-normal text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
          selectedIds.length > 0 && "text-foreground"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <Folder className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--anchor-width] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              {search ? "No collections found" : "No collections yet"}
            </p>
          ) : (
            filtered.map((collection) => {
              const isSelected = selectedIds.includes(collection.id)
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => toggle(collection.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{collection.name}</span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

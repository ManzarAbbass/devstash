"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Code2, EllipsisVertical, Pencil, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { iconMap } from "@/lib/icons"
import type { CollectionWithStats } from "@/lib/db/collections"
import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog"

export function CollectionCard({ collection }: { collection: CollectionWithStats }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const borderColor = collection.dominantType?.color ?? "var(--border)"

  const handleCardClick = useCallback(() => {
    router.push(`/collections/${collection.id}`)
  }, [router, collection.id])

  async function handleToggleFavorite() {
    const result = await toggleCollectionFavorite(collection.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(result.data.isFavorite ? "Added to favorites" : "Removed from favorites")
    router.refresh()
  }

  const handleDropdownSelect = useCallback((action: string) => {
    setDropdownOpen(false)
    if (action === "edit") setEditOpen(true)
    else if (action === "delete") setDeleteOpen(true)
    else if (action === "favorite") handleToggleFavorite()
  }, [handleToggleFavorite])

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteCollection(collection.id)
    if (!result.success) {
      toast.error(result.error)
      setDeleting(false)
      return
    }
    toast.success("Collection deleted")
    setDeleteOpen(false)
    setDeleting(false)
    router.refresh()
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === "Enter") handleCardClick() }}
        className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
        style={{ borderLeftWidth: "4px", borderLeftColor: borderColor }}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{collection.name}</span>
          <div className="flex items-center gap-1">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 data-pressed:opacity-100 focus:opacity-100"
              >
                <EllipsisVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuPositioner side="bottom" align="end" sideOffset={4}>
                  <DropdownMenuPopup>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDropdownSelect("favorite") }}>
                      <Star className={`size-3.5 mr-2 ${collection.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                      Favorite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDropdownSelect("edit") }}>
                      <Pencil className="size-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDropdownSelect("delete") }}>
                      <Trash2 className="size-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
        </span>
        {collection.description && (
          <span className="text-sm text-muted-foreground line-clamp-2">{collection.description}</span>
        )}
        {collection.typeIcons.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            {collection.typeIcons.map((type) => {
              const TypeIcon = iconMap[type.icon] || Code2
              return (
                <span key={type.name} title={type.name}>
                  <TypeIcon className="size-3.5" style={{ color: type.color }} />
                </span>
              )
            })}
          </div>
        )}
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={{ id: collection.id, name: collection.name, description: collection.description }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{collection.name}&quot;? Items in this collection will not be deleted — they will just no longer belong to this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="outline">Cancel</Button>} />
            <AlertDialogAction
              render={
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

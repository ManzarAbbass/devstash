"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Star } from "lucide-react"
import { toast } from "sonner"

import { deleteCollection } from "@/actions/collections"
import { Button } from "@/components/ui/button"
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

interface CollectionDetailHeaderProps {
  collection: {
    id: string
    name: string
    description: string | null
    isFavorite: boolean
  }
  itemCount: number
}

export function CollectionDetailHeader({ collection, itemCount }: CollectionDetailHeaderProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    router.push("/collections")
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.description && (
            <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Favorite">
            <Star className={`size-4 ${collection.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
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

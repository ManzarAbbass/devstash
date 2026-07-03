import { useState } from "react"
import { Star, Pin, Copy, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

interface ItemDrawerActionsProps {
  isEditing: boolean
  isFavorite: boolean
  isPinned: boolean
  itemTitle: string
  saving: boolean
  deleting: boolean
  formTitle: string
  onSave: () => void
  onCancelEdit: () => void
  onEnterEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onTogglePin: () => void
}

export function ItemDrawerActions({
  isEditing,
  isFavorite,
  isPinned,
  itemTitle,
  saving,
  deleting,
  formTitle,
  onSave,
  onCancelEdit,
  onEnterEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
}: ItemDrawerActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-4">
        <Button size="sm" onClick={onSave} disabled={saving || !formTitle.trim()}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancelEdit} disabled={saving}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 px-4">
      <Button variant="ghost" size="icon-sm" aria-label="Favorite" onClick={onToggleFavorite}>
        <Star className={`size-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Pin" onClick={onTogglePin}>
        <Pin className={`size-4 ${isPinned ? "fill-sky-500 text-sky-500" : ""}`} />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Copy">
        <Copy className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={onEnterEdit}>
        <Pencil className="size-4" />
      </Button>
      <div className="ml-auto">
        <Button variant="ghost" size="icon-sm" aria-label="Delete" className="text-destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
        </Button>
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete item"
          description={`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`}
          onConfirm={onDelete}
          isDeleting={deleting}
        />
      </div>
    </div>
  )
}

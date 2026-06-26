import { Star, Pin, Copy, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

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
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Delete" className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{itemTitle}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel render={<Button variant="outline">Cancel</Button>} />
              <AlertDialogAction
                render={
                  <Button variant="destructive" onClick={onDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                }
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

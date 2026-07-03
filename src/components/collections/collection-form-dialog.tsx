"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormSection } from "@/components/ui/form-section"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { createCollection, updateCollection } from "@/actions/collections"

interface CollectionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  collection?: {
    id: string
    name: string
    description: string | null
  }
}

export function CollectionFormDialog({ open, onOpenChange, mode, collection }: CollectionFormDialogProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)

  const [name, setName] = useState(collection?.name ?? "")
  const [description, setDescription] = useState(collection?.description ?? "")

  const isEdit = mode === "edit"

  function resetForm() {
    setName(collection?.name ?? "")
    setDescription(collection?.description ?? "")
    setFormErrors(null)
  }

  function handleOpenChange(newOpen: boolean) {
    onOpenChange(newOpen)
    if (!newOpen) resetForm()
  }

  async function handleSubmit() {
    setSaving(true)
    setFormErrors(null)

    const result = isEdit
      ? await updateCollection(collection!.id, { name: name.trim(), description: description.trim() || null })
      : await createCollection({ name: name.trim(), description: description.trim() || null })

    if (!result.success) {
      if (typeof result.error === "object") {
        setFormErrors(result.error)
      } else {
        toast.error(result.error)
      }
      setSaving(false)
      return
    }

    toast.success(isEdit ? "Collection updated" : "Collection created")
    handleOpenChange(false)
    router.refresh()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Collection" : "New Collection"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the collection name and description." : "Create a new collection to organize your items."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <FormSection label="Name" required fieldName="name" errors={formErrors}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              className="h-8"
            />
          </FormSection>

          <FormSection label="Description" fieldName="description" errors={formErrors}>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
            />
          </FormSection>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Collection")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

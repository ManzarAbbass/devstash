"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/ui/code-editor"
import { FileUpload } from "@/components/items/file-upload"
import { FieldError } from "@/components/ui/field-error"
import { ItemTypeSelector } from "@/components/items/item-type-selector"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { createItem } from "@/actions/items"
import type { ItemTypeWithCount } from "@/lib/db/items"

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTypes: ItemTypeWithCount[]
  initialType?: string
}

const creationTypes = ["snippet", "prompt", "command", "note", "file", "image", "link"] as const

export function CreateItemDialog({ open, onOpenChange, itemTypes, initialType }: CreateItemDialogProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState(initialType && creationTypes.includes(initialType as typeof creationTypes[number]) ? initialType : "snippet")
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [fileData, setFileData] = useState<{ fileUrl: string; fileName: string; fileSize: number } | null>(null)

  useEffect(() => {
    if (open && initialType && creationTypes.includes(initialType as typeof creationTypes[number])) {
      setSelectedType(initialType)
    }
  }, [open, initialType])

  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType)
  const showLanguage = ["snippet", "command"].includes(selectedType)
  const showUrl = selectedType === "link"
  const isFileType = ["file", "image"].includes(selectedType)

  function resetForm() {
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
    setFileData(null)
    setFormErrors(null)
    setSelectedType(initialType && creationTypes.includes(initialType as typeof creationTypes[number]) ? initialType : "snippet")
  }

  function handleOpenChange(newOpen: boolean) {
    onOpenChange(newOpen)
    if (!newOpen) resetForm()
  }

  async function handleSubmit() {
    setSaving(true)
    setFormErrors(null)

    const type = itemTypes.find((t) => t.name === selectedType)
    if (!type) {
      toast.error("Invalid item type")
      setSaving(false)
      return
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (isFileType && !fileData) {
      toast.error("Please upload a file")
      setSaving(false)
      return
    }

    const result = await createItem({
      title: title.trim(),
      contentType: selectedType,
      itemTypeId: type.id,
      description: description || null,
      content: showContent ? (content || null) : null,
      language: showLanguage ? (language || null) : null,
      url: showUrl ? (url || null) : null,
      tags: tagList,
      fileUrl: fileData?.fileUrl ?? null,
      fileName: fileData?.fileName ?? null,
      fileSize: fileData?.fileSize ?? null,
    })

    if (!result.success) {
      if (typeof result.error === "object") {
        setFormErrors(result.error)
      } else {
        toast.error(result.error)
      }
      setSaving(false)
      return
    }

    toast.success("Item created")
    handleOpenChange(false)
    router.refresh()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>Choose a type and fill in the details below.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="flex flex-col gap-5">
            {/* Type selector */}
            <ItemTypeSelector selectedType={selectedType} onSelect={setSelectedType} />

            <hr className="border-border" />

            {/* Title */}
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title <span className="text-destructive">*</span>
              </h3>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Item title"
                className="h-8"
              />
              <FieldError field="title" errors={formErrors} />
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h3>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
              />
              <FieldError field="description" errors={formErrors} />
            </div>

            {/* Content */}
            {showContent && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Content
                </h3>
                {showLanguage ? (
                  <CodeEditor
                    value={content}
                    onChange={(v) => setContent(v ?? "")}
                    language={language || "plaintext"}
                  />
                ) : (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content (optional)"
                    rows={5}
                  />
                )}
                <FieldError field="content" errors={formErrors} />
              </div>
            )}

            {/* Language */}
            {showLanguage && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Language
                </h3>
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. typescript, python"
                  className="h-8"
                />
                <FieldError field="language" errors={formErrors} />
              </div>
            )}

            {/* URL */}
            {showUrl && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  URL <span className="text-destructive">*</span>
                </h3>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-8"
                />
                <FieldError field="url" errors={formErrors} />
              </div>
            )}

            {/* File / Image upload */}
            {isFileType && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {selectedType === "image" ? "Image" : "File"}
                </h3>
                <FileUpload
                  accept={
                    selectedType === "image"
                      ? "image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                      : "application/pdf,text/plain,text/markdown,application/json,application/x-yaml,text/yaml,application/xml,text/xml,text/csv,application/toml"
                  }
                  maxSize={selectedType === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024}
                  onUploadComplete={(data) => setFileData(data)}
                  onRemove={() => setFileData(null)}
                />
                <FieldError field="fileUrl" errors={formErrors} />
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </h3>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="h-8"
              />
              <FieldError field="tags" errors={formErrors} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving ? "Creating..." : "Create Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

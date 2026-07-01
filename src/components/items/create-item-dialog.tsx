"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/ui/code-editor"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { useEditorPreferences } from "@/lib/editor-preferences-context"
import { FileUpload } from "@/components/items/file-upload"
import { FieldError } from "@/components/ui/field-error"
import { ItemTypeSelector } from "@/components/items/item-type-selector"
import { CollectionSelect } from "@/components/items/collection-select"
import { SelectRoot, SelectItem } from "@/components/ui/select"
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { createItem } from "@/actions/items"
import { suggestTags, suggestDescription } from "@/actions/ai"
import { getUserCollections } from "@/actions/collections"
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
  const { data: session } = useSession()
  const isPro = session?.user?.isPro ?? false
  const { preferences: editorPrefs } = useEditorPreferences()
  const [selectedType, setSelectedType] = useState(initialType && creationTypes.includes(initialType as typeof creationTypes[number]) ? initialType : "snippet")
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestingTags, setSuggestingTags] = useState(false)
  const [suggestingDescription, setSuggestingDescription] = useState(false)
  const [fileData, setFileData] = useState<{ fileUrl: string; fileName: string; fileSize: number } | null>(null)
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    getUserCollections().then(setCollections)
  }, [open])

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
    setSuggestedTags([])
    setSuggestingTags(false)
    setSuggestingDescription(false)
    setFileData(null)
    setFormErrors(null)
    setSelectedCollectionIds([])
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
      collectionIds: selectedCollectionIds,
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

  async function handleSuggestDescription() {
    if (!title.trim()) return
    setSuggestingDescription(true)
    const result = await suggestDescription({ title: title.trim() })
    setSuggestingDescription(false)
    if (result.success) {
      setDescription(result.description)
    } else {
      toast.error(result.error)
    }
  }

  async function handleSuggestTags() {
    if (!title.trim()) return
    setSuggestingTags(true)
    const result = await suggestTags({ title: title.trim() })
    setSuggestingTags(false)
    if (result.success) {
      setSuggestedTags(result.tags)
    } else {
      toast.error(result.error)
    }
  }

  function handleAcceptTag(tag: string) {
    setTags((prev) => (prev ? `${prev}, ${tag}` : tag))
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleRejectTag(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>Choose a type and fill in the details below.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-none -mx-6 px-6">
          <div className="flex flex-col gap-5">
            {/* Type selector */}
            <ItemTypeSelector selectedType={selectedType} onSelect={setSelectedType} isPro={isPro} />

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
                className="scrollbar-none"
              />
              {title.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleSuggestDescription}
                  disabled={suggestingDescription}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Sparkles className="size-3" />
                  {suggestingDescription ? "Generating..." : "Suggest Description"}
                </button>
              )}
              <FieldError field="description" errors={formErrors} />
            </div>

            {/* Language */}
            {showLanguage && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Language
                </h3>
                <SelectRoot value={language} onValueChange={(v) => setLanguage(v ?? "")}>
                  <SelectItem value="">None</SelectItem>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectRoot>
                <FieldError field="language" errors={formErrors} />
              </div>
            )}

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
                    preferences={editorPrefs}
                  />
                ) : (
                  <MarkdownEditor
                    value={content}
                    onChange={(v) => setContent(v)}
                    placeholder="Content (optional)"
                    minRows={5}
                  />
                )}
                <FieldError field="content" errors={formErrors} />
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
              {title.trim().length > 0 && suggestedTags.length === 0 && (
                <button
                  type="button"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Sparkles className="size-3" />
                  {suggestingTags ? "Suggesting..." : "Suggest Tags"}
                </button>
              )}
              {suggestedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 pl-2.5 pr-1 py-0.5 text-xs"
                    >
                      <span className="text-muted-foreground">#</span>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleAcceptTag(tag)}
                        className="ml-0.5 rounded-full p-0.5 text-green-600 hover:bg-green-500/10 hover:text-green-700 transition-colors"
                        title="Accept tag"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectTag(tag)}
                        className="rounded-full p-0.5 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                        title="Reject tag"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <FieldError field="tags" errors={formErrors} />
            </div>

            {/* Collections */}
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Collections
              </h3>
              <CollectionSelect
                collections={collections}
                selectedIds={selectedCollectionIds}
                onChange={setSelectedCollectionIds}
                disabled={saving}
              />
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

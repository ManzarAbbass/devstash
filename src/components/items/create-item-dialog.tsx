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
import { FormSection } from "@/components/ui/form-section"
import { SuggestedTags } from "@/components/ui/suggested-tags"
import { ItemTypeSelector } from "@/components/items/item-type-selector"
import { CollectionSelect } from "@/components/items/collection-select"
import { SelectRoot, SelectItem } from "@/components/ui/select"
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { useAiSuggestions } from "@/hooks/use-ai-suggestions"
import { ALL_CREATION_TYPES, hasContent, hasLanguage, hasUrl, isFileType as checkFileType } from "@/lib/content-types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { createItem } from "@/actions/items"
import { getUserCollections } from "@/actions/collections"
import type { ItemTypeWithCount } from "@/lib/db/items"

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTypes: ItemTypeWithCount[]
  initialType?: string
}

export function CreateItemDialog({ open, onOpenChange, itemTypes, initialType }: CreateItemDialogProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isPro = session?.user?.isPro ?? false
  const { preferences: editorPrefs } = useEditorPreferences()
  const ai = useAiSuggestions()
  const [selectedType, setSelectedType] = useState(
    initialType && (ALL_CREATION_TYPES as readonly string[]).includes(initialType) ? initialType : "snippet"
  )
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [fileData, setFileData] = useState<{ fileUrl: string; fileName: string; fileSize: number } | null>(null)
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])

  const showContent = hasContent(selectedType)
  const showLanguage = hasLanguage(selectedType)
  const showUrl = hasUrl(selectedType)
  const isFileType = checkFileType(selectedType)

  useEffect(() => {
    if (!open) return
    getUserCollections().then(setCollections)
  }, [open])

  function resetForm() {
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
    ai.resetSuggestions()
    setFileData(null)
    setFormErrors(null)
    setSelectedCollectionIds([])
    setSelectedType(
      initialType && (ALL_CREATION_TYPES as readonly string[]).includes(initialType) ? initialType : "snippet"
    )
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
            <FormSection label="Title" required fieldName="title" errors={formErrors}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Item title"
                className="h-8"
              />
            </FormSection>

            {/* Description */}
            <FormSection label="Description" fieldName="description" errors={formErrors}>
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
                  onClick={() => ai.handleSuggestDescription(title, setDescription)}
                  disabled={ai.suggestingDescription}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Sparkles className="size-3" />
                  {ai.suggestingDescription ? "Generating..." : "Suggest Description"}
                </button>
              )}
            </FormSection>

            {/* Language */}
            {showLanguage && (
              <FormSection label="Language" fieldName="language" errors={formErrors}>
                <SelectRoot value={language} onValueChange={(v) => setLanguage(v ?? "")}>
                  <SelectItem value="">None</SelectItem>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectRoot>
              </FormSection>
            )}

            {/* Content */}
            {showContent && (
              <FormSection label="Content" fieldName="content" errors={formErrors}>
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
              </FormSection>
            )}

            {/* URL */}
            {showUrl && (
              <FormSection label="URL" required fieldName="url" errors={formErrors}>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-8"
                />
              </FormSection>
            )}

            {/* File / Image upload */}
            {isFileType && (
              <FormSection label={selectedType === "image" ? "Image" : "File"} fieldName="fileUrl" errors={formErrors}>
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
              </FormSection>
            )}

            {/* Tags */}
            <FormSection label="Tags" fieldName="tags" errors={formErrors}>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="h-8"
              />
              {title.trim().length > 0 && ai.suggestedTags.length === 0 && (
                <button
                  type="button"
                  onClick={() => ai.handleSuggestTags(title)}
                  disabled={ai.suggestingTags}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Sparkles className="size-3" />
                  {ai.suggestingTags ? "Suggesting..." : "Suggest Tags"}
                </button>
              )}
              <SuggestedTags
                tags={ai.suggestedTags}
                onAccept={(tag) => ai.handleAcceptTag(tag, tags, setTags)}
                onReject={ai.handleRejectTag}
              />
            </FormSection>

            {/* Collections */}
            <FormSection label="Collections">
              <CollectionSelect
                collections={collections}
                selectedIds={selectedCollectionIds}
                onChange={setSelectedCollectionIds}
                disabled={saving}
              />
            </FormSection>
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

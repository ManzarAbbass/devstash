"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Code2, Sparkles, Terminal, StickyNote, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
}

const creationTypes = ["snippet", "prompt", "command", "note", "link"] as const

const typeMeta: Record<string, { icon: typeof Code2; label: string; color: string }> = {
  snippet: { icon: Code2, label: "Snippet", color: "#3b82f6" },
  prompt: { icon: Sparkles, label: "Prompt", color: "#8b5cf6" },
  command: { icon: Terminal, label: "Command", color: "#f97316" },
  note: { icon: StickyNote, label: "Note", color: "#fde047" },
  link: { icon: Link2, label: "Link", color: "#10b981" },
}

function FieldError({ field, errors }: { field: string; errors: Record<string, string[]> | null }) {
  if (!errors?.[field]) return null
  return <p className="mt-1 text-xs text-destructive">{errors[field][0]}</p>
}

export function CreateItemDialog({ open, onOpenChange, itemTypes }: CreateItemDialogProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState("snippet")
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")

  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType)
  const showLanguage = ["snippet", "command"].includes(selectedType)
  const showUrl = selectedType === "link"

  const currentMeta = typeMeta[selectedType]

  function resetForm() {
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
    setFormErrors(null)
    setSelectedType("snippet")
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

    const result = await createItem({
      title: title.trim(),
      contentType: selectedType,
      itemTypeId: type.id,
      description: description || null,
      content: showContent ? (content || null) : null,
      language: showLanguage ? (language || null) : null,
      url: showUrl ? (url || null) : null,
      tags: tagList,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>Choose a type and fill in the details below.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="flex flex-col gap-5">
            {/* Type selector */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {creationTypes.map((type) => {
                  const meta = typeMeta[type]
                  const Icon = meta.icon
                  const isSelected = selectedType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs capitalize transition-colors ${
                        isSelected
                          ? "border-ring bg-muted text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-5" style={{ color: meta.color }} />
                      <span>{meta.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

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
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content (optional)"
                  rows={5}
                />
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

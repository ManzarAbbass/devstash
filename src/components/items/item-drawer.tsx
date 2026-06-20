"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/ui/code-editor"
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
import type { ItemWithDetails } from "@/lib/db/items"
import { updateItem, deleteItem } from "@/actions/items"
import type { UpdateItemData } from "@/actions/items"

const iconMap: Record<string, typeof Code2> = {
  Code: Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

const contentTypesWithContent = ["snippet", "prompt", "command", "note"]
const contentTypesWithLanguage = ["snippet", "command"]
const contentTypesWithUrl = ["link"]
const contentTypesWithFile = ["file", "image"]

function extractFileKey(publicUrl: string): string {
  const url = new URL(publicUrl)
  const segments = url.pathname.split("/")
  const storageIndex = segments.indexOf("devstash")
  return segments.slice(storageIndex + 1).join("/")
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DrawerSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 p-4">
      <div className="h-6 w-2/3 rounded bg-muted" />
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="mt-2 h-8 w-full rounded bg-muted" />
      <div className="h-20 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
    </div>
  )
}

function FieldError({ field, errors }: { field: string; errors: Record<string, string[]> | null }) {
  if (!errors?.[field]) return null
  return (
    <p className="mt-1 text-xs text-destructive">{errors[field][0]}</p>
  )
}

export function ItemDrawer({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [item, setItem] = useState<ItemWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formLanguage, setFormLanguage] = useState("")
  const [formUrl, setFormUrl] = useState("")
  const [formTags, setFormTags] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item")
        return res.json()
      })
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [itemId])

  if (loading) {
    return (
      <>
        <SheetHeader>
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        </SheetHeader>
        <DrawerSkeleton />
      </>
    )
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        {error || "Item not found"}
      </div>
    )
  }

  const Icon = iconMap[item.itemType.icon] || Code2
  const typeName = item.itemType.name.toLowerCase()

  function handleEnterEdit() {
    if (!item) return
    setFormTitle(item.title)
    setFormDescription(item.description ?? "")
    setFormContent(item.content ?? "")
    setFormLanguage(item.language ?? "")
    setFormUrl(item.url ?? "")
    setFormTags(item.tags.map((t) => t.name).join(", "))
    setFormErrors(null)
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setFormErrors(null)
  }

  function handleDownload() {
    if (!item?.fileUrl) return
    const url = `/api/download/${extractFileKey(item.fileUrl)}`
    const a = document.createElement("a")
    a.href = url
    a.download = item.fileName || "download"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function handleDelete() {
    if (!item) return
    setDeleting(true)

    const result = await deleteItem(item.id)

    if (!result.success) {
      toast.error(result.error)
      setDeleting(false)
      return
    }

    toast.success("Item deleted")
    router.refresh()
  }

  async function handleSave() {
    if (!item) return
    setSaving(true)
    setFormErrors(null)

    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const data: UpdateItemData = {
      title: formTitle,
      description: formDescription || null,
      content: contentTypesWithContent.includes(typeName) ? (formContent || null) : null,
      language: contentTypesWithLanguage.includes(typeName) ? (formLanguage || null) : null,
      url: contentTypesWithUrl.includes(typeName) ? (formUrl || null) : null,
      tags,
    }

    const result = await updateItem(item.id, data)

    if (!result.success) {
      if (typeof result.error === "object") {
        setFormErrors(result.error)
      } else {
        toast.error(result.error)
      }
      setSaving(false)
      return
    }

    setItem(result.data)
    setIsEditing(false)
    toast.success("Item updated")
    router.refresh()
    setSaving(false)
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-5 shrink-0" style={{ color: item.itemType.color }} />
          {isEditing ? (
            <div className="flex-1">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title"
                className="h-8 text-base font-semibold"
              />
              <FieldError field="title" errors={formErrors} />
            </div>
          ) : (
            <SheetTitle className="truncate">{item.title}</SheetTitle>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {item.itemType.name}
          </Badge>
          {!isEditing && item.language && (
            <Badge variant="outline" className="text-[10px]">
              {item.language}
            </Badge>
          )}
        </div>
      </SheetHeader>

      {isEditing ? (
        <div className="flex items-center gap-2 px-4">
          <Button size="sm" onClick={handleSave} disabled={saving || !formTitle.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={saving}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 px-4">
          <Button variant="ghost" size="icon-sm" aria-label="Favorite">
            <Star
              className={`size-4 ${item.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`}
            />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Pin">
            <Pin
              className={`size-4 ${item.isPinned ? "fill-sky-500 text-sky-500" : ""}`}
            />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Copy">
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={handleEnterEdit}>
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
                    Are you sure you want to delete "{item.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    render={<Button variant="outline">Cancel</Button>}
                  />
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
          </div>
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4 scrollbar-none">
        {/* Description */}
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </h3>
          {isEditing ? (
            <div>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
              />
              <FieldError field="description" errors={formErrors} />
            </div>
          ) : (
            item.description && <p className="text-sm leading-relaxed">{item.description}</p>
          )}
        </div>

        {/* File / Image */}
        {contentTypesWithFile.includes(typeName) && item.fileUrl && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {typeName === "image" ? "Image" : "File"}
              </h3>
              {typeName === "image" && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-1.5 size-3.5" />
                  Download
                </Button>
              )}
            </div>
            <div className="rounded-lg border border-border p-3">
              {typeName === "image" ? (
                <div className="overflow-hidden rounded">
                  <img
                    src={item.fileUrl}
                    alt={item.fileName ?? "Image"}
                    className="w-full rounded object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
                    <File className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.fileName}</p>
                    {item.fileSize != null && (
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1.5 size-3.5" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {contentTypesWithContent.includes(typeName) && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </h3>
            {isEditing ? (
              <div>
                {contentTypesWithLanguage.includes(typeName) ? (
                  <CodeEditor
                    value={formContent}
                    onChange={(v) => setFormContent(v ?? "")}
                    language={formLanguage || "plaintext"}
                  />
                ) : (
                  <Textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Content (optional)"
                    rows={6}
                  />
                )}
                <FieldError field="content" errors={formErrors} />
              </div>
            ) : (
              item.content && (
                contentTypesWithLanguage.includes(typeName) ? (
                  <CodeEditor
                    value={item.content}
                    language={item.language}
                    readOnly
                  />
                ) : (
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs leading-relaxed">
                    {item.content}
                  </pre>
                )
              )
            )}
          </div>
        )}

        {/* Language */}
        {contentTypesWithLanguage.includes(typeName) && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Language
            </h3>
            {isEditing ? (
              <div>
                <Input
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  placeholder="Language (optional)"
                  className="h-8"
                />
                <FieldError field="language" errors={formErrors} />
              </div>
            ) : (
              item.language && <p className="text-sm">{item.language}</p>
            )}
          </div>
        )}

        {/* URL */}
        {contentTypesWithUrl.includes(typeName) && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              URL
            </h3>
            {isEditing ? (
              <div>
                <Input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-8"
                />
                <FieldError field="url" errors={formErrors} />
              </div>
            ) : (
              item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm underline underline-offset-2 hover:text-foreground"
                >
                  {item.url}
                </a>
              )
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </h3>
          {isEditing ? (
            <div>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="h-8"
              />
              <FieldError field="tags" errors={formErrors} />
            </div>
          ) : (
            item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-[10px]">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )
          )}
        </div>

        {/* Details — non-editable */}
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Created{" "}
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {!isEditing && item.url && contentTypesWithUrl.includes(typeName) && (
              <p className="truncate">
                URL:{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {item.url}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

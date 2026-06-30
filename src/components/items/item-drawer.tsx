"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Code2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  SheetHeader,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/ui/code-editor"
import { useEditorPreferences } from "@/lib/editor-preferences-context"
import type { ItemWithDetails } from "@/lib/db/items"
import { updateItem, deleteItem, toggleItemFavorite, toggleItemPin } from "@/actions/items"
import type { UpdateItemData } from "@/actions/items"
import { iconMap } from "@/lib/icons"
import { extractFileKey } from "@/lib/utils"
import { FieldError } from "@/components/ui/field-error"
import { CollectionSelect } from "@/components/items/collection-select"
import { SelectRoot, SelectItem } from "@/components/ui/select"
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { getUserCollections } from "@/actions/collections"
import { ItemDrawerHeader } from "./item-drawer-header"
import { ItemDrawerActions } from "./item-drawer-actions"
import { FileDisplay } from "./file-display"

const contentTypesWithContent = ["snippet", "prompt", "command", "note"]
const contentTypesWithLanguage = ["snippet", "command"]
const contentTypesWithUrl = ["link"]
const contentTypesWithFile = ["file", "image"]

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

export function ItemDrawer({ itemId }: { itemId: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { preferences: editorPrefs } = useEditorPreferences()
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
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [itemCollectionIds, setItemCollectionIds] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const controller = new AbortController()

    fetch(`/api/items/${itemId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item")
        return res.json()
      })
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message)
        setLoading(false)
      })

    getUserCollections().then(setCollections)

    fetch(`/api/items/${itemId}/collections`)
      .then((res) => {
        if (!res.ok) return []
        return res.json()
      })
      .then((ids: string[]) => {
        setItemCollectionIds(ids)
        setSelectedCollectionIds(ids)
      })
      .catch(() => {})

    return () => controller.abort()
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
  const itemCollections = collections.filter((c) => itemCollectionIds.includes(c.id))

  function handleEnterEdit() {
    if (!item) return
    setFormTitle(item.title)
    setFormDescription(item.description ?? "")
    setFormContent(item.content ?? "")
    setFormLanguage(item.language ?? "")
    setFormUrl(item.url ?? "")
    setFormTags(item.tags.map((t) => t.name).join(", "))
    setSelectedCollectionIds(itemCollectionIds)
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

  async function handleToggleFavorite() {
    if (!item) return
    const result = await toggleItemFavorite(item.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setItem(result.data)
    router.refresh()
  }

  async function handleTogglePin() {
    if (!item) return
    const result = await toggleItemPin(item.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setItem(result.data)
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
      collectionIds: selectedCollectionIds,
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
      <ItemDrawerHeader
        Icon={Icon}
        color={item.itemType.color}
        title={item.title}
        itemTypeName={item.itemType.name}
        language={item.language}
        isEditing={isEditing}
        formTitle={formTitle}
        formErrors={formErrors}
        onFormTitleChange={setFormTitle}
      />

      <ItemDrawerActions
        isEditing={isEditing}
        isFavorite={item.isFavorite}
        isPinned={item.isPinned}
        itemTitle={item.title}
        saving={saving}
        deleting={deleting}
        formTitle={formTitle}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onEnterEdit={handleEnterEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={handleTogglePin}
      />

      <Separator />

      <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
          <FileDisplay
            fileUrl={item.fileUrl}
            fileName={item.fileName}
            fileSize={item.fileSize}
            typeName={typeName}
            onDownload={handleDownload}
            isPro={session?.user?.isPro}
          />
        )}

        {/* Language */}
        {contentTypesWithLanguage.includes(typeName) && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Language
            </h3>
            {isEditing ? (
              <div>
                <SelectRoot value={formLanguage} onValueChange={(v) => setFormLanguage(v ?? "")}>
                  <SelectItem value="">None</SelectItem>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectRoot>
                <FieldError field="language" errors={formErrors} />
              </div>
            ) : (
              item.language && <p className="text-sm">{item.language}</p>
            )}
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
                    preferences={editorPrefs}
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
                    preferences={editorPrefs}
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

        {/* Collections */}
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Collections
          </h3>
          {isEditing ? (
            <CollectionSelect
              collections={collections}
              selectedIds={selectedCollectionIds}
              onChange={setSelectedCollectionIds}
              disabled={saving}
            />
          ) : itemCollections.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {itemCollections.map((c) => (
                <Badge key={c.id} variant="secondary" className="text-[10px]">
                  {c.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not in any collection</p>
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

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Code2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  SheetHeader,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/ui/code-editor"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { useEditorPreferences } from "@/lib/editor-preferences-context"
import type { ItemWithDetails } from "@/lib/db/items"
import { updateItem, deleteItem, toggleItemFavorite, toggleItemPin } from "@/actions/items"
import { explainCode, optimizePrompt } from "@/actions/ai"
import type { UpdateItemData } from "@/actions/items"
import { iconMap } from "@/lib/icons"
import { extractFileKey } from "@/lib/utils"
import { FormSection } from "@/components/ui/form-section"
import { SuggestedTags } from "@/components/ui/suggested-tags"
import { useAiSuggestions } from "@/hooks/use-ai-suggestions"
import { CollectionSelect } from "@/components/items/collection-select"
import { SelectRoot, SelectItem } from "@/components/ui/select"
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { getUserCollections } from "@/actions/collections"
import {
  CONTENT_TYPES_WITH_CONTENT,
  CONTENT_TYPES_WITH_LANGUAGE,
  CONTENT_TYPES_WITH_URL,
  CONTENT_TYPES_WITH_FILE,
} from "@/lib/content-types"
import { ItemDrawerHeader } from "./item-drawer-header"
import { ItemDrawerActions } from "./item-drawer-actions"
import { FileDisplay } from "./file-display"

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
  const ai = useAiSuggestions()
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null)
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [itemCollectionIds, setItemCollectionIds] = useState<string[]>([])
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

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
    ai.resetSuggestions()
    setSelectedCollectionIds(itemCollectionIds)
    setFormErrors(null)
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)
    ai.resetSuggestions()
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

  async function handleExplain() {
    if (!item?.content) return
    setIsExplaining(true)
    setExplanation(null)

    const result = await explainCode({
      content: item.content,
      language: item.language ?? undefined,
    })

    if (!result.success) {
      toast.error(result.error)
      setIsExplaining(false)
      return
    }

    setExplanation(result.explanation)
    setIsExplaining(false)
  }

  async function handleOptimize() {
    if (!item?.content) return
    setIsOptimizing(true)
    setOptimizedPrompt(null)

    const result = await optimizePrompt({
      content: item.content,
    })

    if (!result.success) {
      toast.error(result.error)
      setIsOptimizing(false)
      return
    }

    setOptimizedPrompt(result.optimized)
    setIsOptimizing(false)
  }

  async function handleAcceptOptimized() {
    if (!item || !optimizedPrompt) return
    setSaving(true)

    const tags = item.tags.map((t) => t.name)

    const data: UpdateItemData = {
      title: item.title,
      description: item.description,
      content: optimizedPrompt,
      tags,
      collectionIds: itemCollectionIds,
    }

    const result = await updateItem(item.id, data)

    if (!result.success) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to update")
      setSaving(false)
      return
    }

    setItem(result.data)
    setOptimizedPrompt(null)
    setSaving(false)
    toast.success("Prompt optimized")
    router.refresh()
  }

  function handleRejectOptimized() {
    setOptimizedPrompt(null)
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
      content: (CONTENT_TYPES_WITH_CONTENT as readonly string[]).includes(typeName) ? (formContent || null) : null,
      language: (CONTENT_TYPES_WITH_LANGUAGE as readonly string[]).includes(typeName) ? (formLanguage || null) : null,
      url: (CONTENT_TYPES_WITH_URL as readonly string[]).includes(typeName) ? (formUrl || null) : null,
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
        {isEditing ? (
          <FormSection label="Description" fieldName="description" errors={formErrors}>
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
            />
            {formTitle.trim().length > 0 && (
              <button
                type="button"
                onClick={() => ai.handleSuggestDescription(formTitle, setFormDescription)}
                disabled={ai.suggestingDescription}
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Sparkles className="size-3" />
                {ai.suggestingDescription ? "Generating..." : "Suggest Description"}
              </button>
            )}
          </FormSection>
        ) : (
          item.description && (
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-relaxed">{item.description}</p>
            </div>
          )
        )}

        {/* File / Image */}
        {(CONTENT_TYPES_WITH_FILE as readonly string[]).includes(typeName) && item.fileUrl && (
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
        {(CONTENT_TYPES_WITH_LANGUAGE as readonly string[]).includes(typeName) && (
          isEditing ? (
            <FormSection label="Language" fieldName="language" errors={formErrors}>
              <SelectRoot value={formLanguage} onValueChange={(v) => setFormLanguage(v ?? "")}>
                <SelectItem value="">None</SelectItem>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectRoot>
            </FormSection>
          ) : (
            item.language && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Language
                </h3>
                <p className="text-sm">{item.language}</p>
              </div>
            )
          )
        )}

        {/* Content */}
        {(CONTENT_TYPES_WITH_CONTENT as readonly string[]).includes(typeName) && (
          isEditing ? (
            <FormSection label="Content" fieldName="content" errors={formErrors}>
              {(CONTENT_TYPES_WITH_LANGUAGE as readonly string[]).includes(typeName) ? (
                <CodeEditor
                  value={formContent}
                  onChange={(v) => setFormContent(v ?? "")}
                  language={formLanguage || "plaintext"}
                  preferences={editorPrefs}
                />
              ) : (
                <MarkdownEditor
                  value={formContent}
                  onChange={(v) => setFormContent(v)}
                  placeholder="Content (optional)"
                  minRows={6}
                />
              )}
            </FormSection>
          ) : (
            <div>
              {item.content && (
                <div>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Content
                  </h3>
                  {(CONTENT_TYPES_WITH_LANGUAGE as readonly string[]).includes(typeName) ? (
                    <CodeEditor
                      value={item.content}
                      language={item.language}
                      readOnly
                      preferences={editorPrefs}
                      showExplain={!isEditing}
                      explanation={explanation}
                      isExplaining={isExplaining}
                      isPro={session?.user?.isPro ?? false}
                      onExplain={handleExplain}
                    />
                  ) : (
                    <MarkdownEditor
                      value={item.content}
                      readOnly
                      minRows={3}
                      showOptimize={typeName === "prompt"}
                      isOptimizing={isOptimizing}
                      isPro={session?.user?.isPro ?? false}
                      onOptimize={handleOptimize}
                    />
                  )}
                  {optimizedPrompt && (
                  <div className="mt-3 rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between bg-muted px-3 py-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Optimized
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Use this?
                      </span>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-3 text-sm whitespace-pre-wrap leading-relaxed [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {optimizedPrompt}
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
                      <button
                        type="button"
                        onClick={handleRejectOptimized}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptOptimized}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        ✓ Accept
                      </button>
                    </div>
          </div>
        )}
              </div>
            )}
          </div>
        ))}

        {/* URL */}
        {(CONTENT_TYPES_WITH_URL as readonly string[]).includes(typeName) && (
          isEditing ? (
            <FormSection label="URL" required fieldName="url" errors={formErrors}>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://example.com"
                className="h-8"
              />
            </FormSection>
          ) : (
            item.url && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  URL
                </h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm underline underline-offset-2 hover:text-foreground"
                >
                  {item.url}
                </a>
              </div>
            )
          )
        )}

        {/* Tags */}
        {isEditing ? (
          <FormSection label="Tags" fieldName="tags" errors={formErrors}>
            <Input
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="h-8"
            />
            {formTitle.trim().length > 0 && ai.suggestedTags.length === 0 && (
              <button
                type="button"
                onClick={() => ai.handleSuggestTags(formTitle)}
                disabled={ai.suggestingTags}
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Sparkles className="size-3" />
                {ai.suggestingTags ? "Suggesting..." : "Suggest Tags"}
              </button>
            )}
            <SuggestedTags
              tags={ai.suggestedTags}
              onAccept={(tag) => ai.handleAcceptTag(tag, formTags, setFormTags)}
              onReject={ai.handleRejectTag}
            />
          </FormSection>
        ) : (
          item.tags.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-[10px]">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )
        )}

        {/* Collections */}
        {isEditing ? (
          <FormSection label="Collections">
            <CollectionSelect
              collections={collections}
              selectedIds={selectedCollectionIds}
              onChange={setSelectedCollectionIds}
              disabled={saving}
            />
          </FormSection>
        ) : itemCollections.length > 0 ? (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {itemCollections.map((c) => (
                <Badge key={c.id} variant="secondary" className="text-[10px]">
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </h3>
            <p className="text-xs text-muted-foreground">Not in any collection</p>
          </div>
        )}

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
            {!isEditing && item.url && (CONTENT_TYPES_WITH_URL as readonly string[]).includes(typeName) && (
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

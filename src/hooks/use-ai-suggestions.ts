"use client"

import { useState } from "react"
import { toast } from "sonner"
import { suggestTags, suggestDescription } from "@/actions/ai"

interface UseAiSuggestionsReturn {
  suggestedTags: string[]
  setSuggestedTags: (tags: string[]) => void
  suggestingTags: boolean
  suggestingDescription: boolean
  handleSuggestDescription: (title: string, onDescription: (desc: string) => void) => Promise<void>
  handleSuggestTags: (title: string) => Promise<void>
  handleAcceptTag: (tag: string, currentTags: string, onTagsChange: (tags: string) => void) => void
  handleRejectTag: (tag: string) => void
  resetSuggestions: () => void
}

export function useAiSuggestions(): UseAiSuggestionsReturn {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestingTags, setSuggestingTags] = useState(false)
  const [suggestingDescription, setSuggestingDescription] = useState(false)

  async function handleSuggestDescription(title: string, onDescription: (desc: string) => void) {
    if (!title.trim()) return
    setSuggestingDescription(true)
    const result = await suggestDescription({ title: title.trim() })
    setSuggestingDescription(false)
    if (result.success) {
      onDescription(result.description)
    } else {
      toast.error(result.error)
    }
  }

  async function handleSuggestTags(title: string) {
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

  function handleAcceptTag(tag: string, currentTags: string, onTagsChange: (tags: string) => void) {
    onTagsChange(currentTags ? `${currentTags}, ${tag}` : tag)
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleRejectTag(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  function resetSuggestions() {
    setSuggestedTags([])
    setSuggestingTags(false)
    setSuggestingDescription(false)
  }

  return {
    suggestedTags,
    setSuggestedTags,
    suggestingTags,
    suggestingDescription,
    handleSuggestDescription,
    handleSuggestTags,
    handleAcceptTag,
    handleRejectTag,
    resetSuggestions,
  }
}

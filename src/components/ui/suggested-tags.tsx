"use client"

interface SuggestedTagsProps {
  tags: string[]
  onAccept: (tag: string) => void
  onReject: (tag: string) => void
}

export function SuggestedTags({ tags, onAccept, onReject }: SuggestedTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 pl-2.5 pr-1 py-0.5 text-xs"
        >
          <span className="text-muted-foreground">#</span>
          {tag}
          <button
            type="button"
            onClick={() => onAccept(tag)}
            className="ml-0.5 rounded-full p-0.5 text-green-600 hover:bg-green-500/10 hover:text-green-700 transition-colors"
            title="Accept tag"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => onReject(tag)}
            className="rounded-full p-0.5 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
            title="Reject tag"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  )
}

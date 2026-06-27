import { Code2, Sparkles, Terminal, StickyNote, Link2, File, Image } from "lucide-react"

const creationTypes = ["snippet", "prompt", "command", "note", "file", "image", "link"] as const

const typeMeta: Record<string, { icon: typeof Code2; label: string; color: string }> = {
  snippet: { icon: Code2, label: "Snippet", color: "#3b82f6" },
  prompt: { icon: Sparkles, label: "Prompt", color: "#8b5cf6" },
  command: { icon: Terminal, label: "Command", color: "#f97316" },
  note: { icon: StickyNote, label: "Note", color: "#fde047" },
  file: { icon: File, label: "File", color: "#14b8a6" },
  image: { icon: Image, label: "Image", color: "#ec4899" },
  link: { icon: Link2, label: "Link", color: "#10b981" },
}

interface ItemTypeSelectorProps {
  selectedType: string
  onSelect: (type: string) => void
}

export function ItemTypeSelector({ selectedType, onSelect }: ItemTypeSelectorProps) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Type
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {creationTypes.map((type) => {
          const meta = typeMeta[type]
          const Icon = meta.icon
          const isSelected = selectedType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
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
  )
}

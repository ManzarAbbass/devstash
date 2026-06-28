import { Code2, Sparkles, Terminal, StickyNote, Link2, File, Image, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  isPro?: boolean
}

const proTypes = new Set(["file", "image"])

export function ItemTypeSelector({ selectedType, onSelect, isPro }: ItemTypeSelectorProps) {
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
          const isLocked = proTypes.has(type) && !isPro
          return (
            <button
              key={type}
              type="button"
              disabled={isLocked}
              onClick={() => onSelect(type)}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs capitalize transition-colors ${
                isLocked
                  ? "cursor-not-allowed border-border/50 text-muted-foreground/50"
                  : isSelected
                    ? "border-ring bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              }`}
            >
              {isLocked && (
                <div className="absolute right-1 top-1">
                  <Lock className="size-3 text-muted-foreground/50" />
                </div>
              )}
              <Icon className="size-5" style={{ color: isLocked ? undefined : meta.color }} />
              <span className="flex items-center gap-1">{meta.label}{isLocked && <Badge variant="outline" className="text-[9px] leading-none px-1 py-0 h-3.5">PRO</Badge>}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

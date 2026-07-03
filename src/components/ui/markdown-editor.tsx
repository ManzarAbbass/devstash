"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Sparkles, Crown, LoaderCircle } from "lucide-react"
import { TrafficLights } from "@/components/ui/traffic-lights"

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  minRows?: number
  maxHeight?: number
  readOnly?: boolean
  showOptimize?: boolean
  isOptimizing?: boolean
  isPro?: boolean
  onOptimize?: () => void
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Content (optional)",
  minRows = 6,
  maxHeight = 400,
  readOnly = false,
  showOptimize = false,
  isOptimizing = false,
  isPro = true,
  onOptimize,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write")

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted px-3 py-1.5">
        <TrafficLights />
        {!readOnly && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                tab === "write"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                tab === "preview"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {showOptimize && !isOptimizing && (
            isPro ? (
              <button
                type="button"
                onClick={onOptimize}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                title="Optimize this prompt"
              >
                <Sparkles className="size-3" />
                Optimize
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground cursor-not-allowed"
                title="AI features require Pro subscription"
              >
                <Crown className="size-3 text-amber-500" />
                Optimize
              </button>
            )
          )}
          {showOptimize && isOptimizing && (
            <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
          )}
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Markdown</span>
        </div>
      </div>
      {tab === "write" && !readOnly ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full resize-y rounded-none border-0 bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
          style={{ maxHeight }}
        />
      ) : (
        <div
          className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto px-3 py-2 text-sm"
          style={{ maxHeight }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  )
}

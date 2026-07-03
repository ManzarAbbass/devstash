"use client"

import { useRef, useCallback, useState } from "react"
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react"
import { Copy, Check, Sparkles, Crown, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrafficLights } from "@/components/ui/traffic-lights"
import { defineEditorThemes } from "@/lib/editor-themes"
import type { EditorPreferences } from "@/lib/editor-preferences"

const languageMap: Record<string, string> = {
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  jsx: "javascript",
  tsx: "typescript",
  python: "python",
  py: "python",
  rust: "rust",
  rs: "rust",
  go: "go",
  golang: "go",
  css: "css",
  scss: "scss",
  html: "html",
  bash: "shell",
  shell: "shell",
  sh: "shell",
  zsh: "shell",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  sql: "sql",
  markdown: "markdown",
  md: "markdown",
  swift: "swift",
  kotlin: "kotlin",
  java: "java",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  csharp: "csharp",
  "c#": "csharp",
  php: "php",
  ruby: "ruby",
  rb: "ruby",
  dart: "dart",
  lua: "lua",
  elixir: "elixir",
  haskell: "haskell",
  scala: "scala",
  perl: "perl",
  r: "r",
  dockerfile: "dockerfile",
  docker: "dockerfile",
  graphql: "graphql",
  gql: "graphql",
  plaintext: "plaintext",
  text: "plaintext",
}

interface CodeEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language?: string | null
  readOnly?: boolean
  preferences?: EditorPreferences
  showExplain?: boolean
  explanation?: string | null
  isExplaining?: boolean
  isPro?: boolean
  onExplain?: () => void
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  preferences,
  showExplain = false,
  explanation = null,
  isExplaining = false,
  isPro = true,
  onExplain,
}: CodeEditorProps) {
  const [tab, setTab] = useState<"code" | "explain">("code")
  const [copied, setCopied] = useState(false)
  const lineCount = (value.match(/\n/g) || []).length + 1
  const initialHeight = Math.min(Math.max(lineCount * 20 + 16, 80), 250)
  const [editorHeight, setEditorHeight] = useState(initialHeight)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const monacoLanguage = language ? (languageMap[language.toLowerCase()] ?? "plaintext") : "plaintext"

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    defineEditorThemes(monaco)
  }, [])

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.onDidContentSizeChange(() => {
      const contentHeight = Math.min(editor.getContentHeight(), 250)
      setEditorHeight(contentHeight)
    })
    const contentHeight = Math.min(editor.getContentHeight(), 250)
    setEditorHeight(contentHeight)
    editor.layout()
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  return (
    <div ref={containerRef} className="code-editor-wrapper overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted px-3 py-1.5">
        <TrafficLights />
        {showExplain && explanation ? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTab("code")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                tab === "code"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => setTab("explain")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                tab === "explain"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Explain
            </button>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {language}
            </span>
          )}
          {showExplain && !isExplaining && (
            isPro ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Explain code"
                onClick={onExplain}
                title="Explain this code"
              >
                <Sparkles className="size-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="AI features require Pro"
                disabled
                title="AI features require Pro subscription"
              >
                <Crown className="size-3.5 text-amber-500" />
              </Button>
            )
          )}
          {showExplain && isExplaining && (
            <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy code"
            onClick={handleCopy}
          >
            {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>
      {showExplain && tab === "explain" && explanation ? (
        <div className="max-h-[250px] overflow-y-auto scrollbar-none p-4 text-sm leading-relaxed">
          <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
            {explanation}
          </div>
        </div>
      ) : (
        <Editor
          height={editorHeight}
          language={monacoLanguage}
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          beforeMount={handleBeforeMount}
          theme={preferences?.theme === "github-dark" ? "githubDark" : preferences?.theme === "monokai" ? "monokai" : preferences?.theme ?? "appDark"}
          options={{
            readOnly,
            minimap: { enabled: preferences?.minimap ?? false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            folding: false,
            fontSize: preferences?.fontSize ?? 12,
            tabSize: preferences?.tabSize ?? 2,
            wordWrap: preferences?.wordWrap ?? "on",
            automaticLayout: true,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              alwaysConsumeMouseWheel: false,
            },
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: readOnly ? "none" : "line",
            contextmenu: !readOnly,
            cursorStyle: readOnly ? "line-thin" : "line",
            guides: { indentation: false },
          }}
          loading={
            <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
              Loading editor...
            </div>
          }
        />
      )}
    </div>
  )
}

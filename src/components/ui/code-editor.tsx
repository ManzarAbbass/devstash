"use client"

import { useRef, useCallback, useState } from "react"
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react"
import { Copy, Check, Sparkles, Crown, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    monaco.editor.defineTheme("appDark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#171717",
        "editor.foreground": "#fafafa",
        "editor.lineHighlightBackground": "#262626",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editorCursor.foreground": "#fafafa",
        "editorLineNumber.foreground": "#6b7280",
        "editorLineNumber.activeForeground": "#d1d5db",
        "editorGutter.background": "#171717",
        "editorRuler.foreground": "#262626",
        "editorWidget.background": "#171717",
        "editorWidget.border": "#262626",
        "editorBracketMatch.background": "#0d0d0d",
        "editorBracketMatch.border": "#6b7280",
        "scrollbarSlider.background": "#52525280",
        "scrollbarSlider.hoverBackground": "#525252cc",
        "scrollbarSlider.activeBackground": "#737373",
        "editorOverviewRuler.background": "#171717",
      },
    })
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "#75715e", fontStyle: "italic" },
        { token: "keyword", foreground: "#f92672" },
        { token: "string", foreground: "#e6db74" },
        { token: "number", foreground: "#ae81ff" },
        { token: "type", foreground: "#66d9ef" },
        { token: "function", foreground: "#a6e22e" },
      ],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#3e3d32",
        "editor.selectionBackground": "#49483e",
        "editorCursor.foreground": "#f8f8f0",
        "editorLineNumber.foreground": "#75715e",
        "editorLineNumber.activeForeground": "#f8f8f2",
        "editorGutter.background": "#272822",
      },
    })
    monaco.editor.defineTheme("githubDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "#8b949e", fontStyle: "italic" },
        { token: "keyword", foreground: "#ff7b72" },
        { token: "string", foreground: "#a5d6ff" },
        { token: "number", foreground: "#79c0ff" },
        { token: "type", foreground: "#ffa657" },
        { token: "function", foreground: "#d2a8ff" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#c9d1d9",
        "editor.lineHighlightBackground": "#161b22",
        "editor.selectionBackground": "#3b5998",
        "editorCursor.foreground": "#c9d1d9",
        "editorLineNumber.foreground": "#484f58",
        "editorLineNumber.activeForeground": "#8b949e",
        "editorGutter.background": "#0d1117",
      },
    })
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
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500" />
          <span className="size-2.5 rounded-full bg-yellow-500" />
          <span className="size-2.5 rounded-full bg-green-500" />
        </div>
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

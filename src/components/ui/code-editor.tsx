"use client"

import { useRef, useCallback, useState } from "react"
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

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
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const lineCount = (value.match(/\n/g) || []).length + 1
  const initialHeight = Math.min(Math.max(lineCount * 20 + 16, 80), 400)
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
        "scrollbarSlider.background": "#6b728066",
        "scrollbarSlider.hoverBackground": "#6b7280b3",
        "scrollbarSlider.activeBackground": "#6b7280",
        "editorOverviewRuler.background": "#171717",
      },
    })
  }, [])

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.onDidContentSizeChange(() => {
      const contentHeight = Math.min(editor.getContentHeight(), 400)
      setEditorHeight(contentHeight)
    })
    const contentHeight = Math.min(editor.getContentHeight(), 400)
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
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {language}
            </span>
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
      <Editor
        height={editorHeight}
        language={monacoLanguage}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        beforeMount={handleBeforeMount}
        theme="appDark"
        options={{
          readOnly,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          folding: false,
          fontSize: 12,
          tabSize: 2,
          wordWrap: "on",
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
    </div>
  )
}

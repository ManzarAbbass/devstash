import type { editor } from "monaco-editor"

export function defineEditorThemes(monaco: { editor: { defineTheme: (name: string, theme: editor.IStandaloneThemeData) => void } }) {
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
}

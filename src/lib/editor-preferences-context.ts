"use client"

import { createContext, useContext } from "react"
import type { EditorPreferences } from "@/lib/editor-preferences"

interface EditorPreferencesContextType {
  preferences: EditorPreferences
  updatePreferences: (prefs: Partial<EditorPreferences>) => void
}

export const EditorPreferencesContext = createContext<EditorPreferencesContextType>({
  preferences: { fontSize: 12, tabSize: 2, wordWrap: "on", minimap: false, theme: "vs-dark" },
  updatePreferences: () => {},
})

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext)
}

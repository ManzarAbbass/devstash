export interface EditorPreferences {
  fontSize: number
  tabSize: number
  wordWrap: "on" | "off"
  minimap: boolean
  theme: "vs-dark" | "monokai" | "github-dark"
}

export const defaultEditorPreferences: EditorPreferences = {
  fontSize: 12,
  tabSize: 2,
  wordWrap: "on",
  minimap: false,
  theme: "vs-dark",
}

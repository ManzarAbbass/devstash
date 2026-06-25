"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { WrapText, Map } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SelectRoot as Select, SelectItem } from "@/components/ui/select"
import { updateEditorPreferences } from "@/actions/settings"
import { useEditorPreferences } from "@/lib/editor-preferences-context"
import type { EditorPreferences } from "@/lib/editor-preferences"

const fontSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 24]
const tabSizes = [1, 2, 3, 4, 5, 6, 8]
const themes = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "github-dark", label: "GitHub Dark" },
] as const

interface EditorPreferencesFormProps {
  initial: EditorPreferences
}

export function EditorPreferencesForm({ initial }: EditorPreferencesFormProps) {
  const { updatePreferences } = useEditorPreferences()
  const [prefs, setPrefs] = useState<EditorPreferences>(initial)
  const [saving, setSaving] = useState(false)

  const save = useCallback(async (updated: EditorPreferences) => {
    setSaving(true)
    const result = await updateEditorPreferences(updated)
    if (result.success) {
      toast.success("Editor preferences saved")
      updatePreferences(updated)
    } else {
      toast.error(result.error || "Failed to save")
    }
    setSaving(false)
  }, [updatePreferences])

  const updateAndSave = useCallback((key: keyof EditorPreferences, value: unknown) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value }
      save(next)
      return next
    })
  }, [save])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size">Font Size</Label>
          <Select
            value={String(prefs.fontSize)}
            onValueChange={(v) => updateAndSave("fontSize", Number(v))}
            disabled={saving}
          >
            {fontSizes.map((s) => (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="tab-size">Tab Size</Label>
          <Select
            value={String(prefs.tabSize)}
            onValueChange={(v) => updateAndSave("tabSize", Number(v))}
            disabled={saving}
          >
            {tabSizes.map((s) => (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Word Wrap</Label>
          <Button
            variant={prefs.wordWrap === "on" ? "default" : "outline"}
            size="icon"
            disabled={saving}
            onClick={() => updateAndSave("wordWrap", prefs.wordWrap === "on" ? "off" : "on")}
          >
            <WrapText className="size-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Label>Minimap</Label>
          <Button
            variant={prefs.minimap ? "default" : "outline"}
            size="icon"
            disabled={saving}
            onClick={() => updateAndSave("minimap", !prefs.minimap)}
          >
            <Map className="size-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={prefs.theme}
            onValueChange={(v) => updateAndSave("theme", v)}
            disabled={saving}
          >
            {themes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

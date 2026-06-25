import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { getEditorPreferences, defaultEditorPreferences } from "@/lib/db/users"
import type { EditorPreferences } from "@/lib/editor-preferences"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("defaultEditorPreferences", () => {
  it("has correct shape and defaults", () => {
    expect(defaultEditorPreferences).toEqual({
      fontSize: 12,
      tabSize: 2,
      wordWrap: "on",
      minimap: false,
      theme: "vs-dark",
    })
  })
})

describe("getEditorPreferences", () => {
  it("returns saved preferences when valid", async () => {
    const saved: EditorPreferences = { fontSize: 16, tabSize: 4, wordWrap: "off", minimap: true, theme: "monokai" }
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: saved } as never)

    const result = await getEditorPreferences("user-1")

    expect(result).toEqual(saved)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { editorPreferences: true },
    })
  })

  it("returns defaults when preferences is null", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: null } as never)

    const result = await getEditorPreferences("user-1")

    expect(result).toEqual(defaultEditorPreferences)
  })

  it("returns defaults when preferences is undefined", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({} as never)

    const result = await getEditorPreferences("user-1")

    expect(result).toEqual(defaultEditorPreferences)
  })

  it("returns defaults when preferences is empty object", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: {} } as never)

    const result = await getEditorPreferences("user-1")

    expect(result).toEqual(defaultEditorPreferences)
  })

  it("falls back to default for individual missing fields", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: { fontSize: 20 } } as never)

    const result = await getEditorPreferences("user-1")

    expect(result.fontSize).toBe(20)
    expect(result.tabSize).toBe(defaultEditorPreferences.tabSize)
    expect(result.wordWrap).toBe(defaultEditorPreferences.wordWrap)
    expect(result.minimap).toBe(defaultEditorPreferences.minimap)
    expect(result.theme).toBe(defaultEditorPreferences.theme)
  })

  it("falls back to default for invalid theme", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: { theme: "solarized" } } as never)

    const result = await getEditorPreferences("user-1")

    expect(result.theme).toBe("vs-dark")
  })

  it("falls back to default for invalid wordWrap", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: { wordWrap: "invalid" } } as never)

    const result = await getEditorPreferences("user-1")

    expect(result.wordWrap).toBe("on")
  })

  it("returns defaults when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const result = await getEditorPreferences("nonexistent")

    expect(result).toEqual(defaultEditorPreferences)
  })
})

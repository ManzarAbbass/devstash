import { describe, it, expect, vi, beforeEach } from "vitest"
import { updateEditorPreferences } from "@/actions/settings"

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const mockSession = { user: { id: "user-1", email: "test@test.com" } }
const validPrefs = { fontSize: 14, tabSize: 4, wordWrap: "on" as const, minimap: true, theme: "monokai" as const }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(mockSession)
})

describe("updateEditorPreferences action", () => {
  it("updates preferences successfully", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const result = await updateEditorPreferences(validPrefs)

    expect(result.success).toBe(true)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: validPrefs },
    })
  })

  it("returns unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await updateEditorPreferences(validPrefs)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Unauthorized")
    }
  })

  it("validates fontSize range", async () => {
    const result = await updateEditorPreferences({ ...validPrefs, fontSize: 4 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it("validates tabSize range", async () => {
    const result = await updateEditorPreferences({ ...validPrefs, tabSize: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it("validates wordWrap enum", async () => {
    const result = await updateEditorPreferences({ ...validPrefs, wordWrap: "invalid" as "on" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it("rejects unknown theme", async () => {
    const result = await updateEditorPreferences({ ...validPrefs, theme: "solarized" as "monokai" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it("returns error when prisma update fails", async () => {
    vi.mocked(prisma.user.update).mockRejectedValue(new Error("DB error"))

    const result = await updateEditorPreferences(validPrefs)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Failed to update preferences")
    }
  })
})

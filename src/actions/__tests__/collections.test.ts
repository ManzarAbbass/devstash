import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCollection } from "@/actions/collections"

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

const mockCreatedCollection = {
  id: "col-new",
  name: "React Patterns",
  description: "Useful React patterns and best practices",
  isFavorite: false,
  defaultTypeId: null,
  createdAt: new Date(),
}

vi.mock("@/lib/db/collections", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as object),
    createCollection: vi.fn(),
  }
})

import { auth } from "@/auth"
import { createCollection as createCollectionQuery } from "@/lib/db/collections"

const mockSession = { user: { id: "user-1", email: "test@test.com" } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(mockSession)
})

describe("createCollection action", () => {
  it("creates a collection successfully", async () => {
    vi.mocked(createCollectionQuery).mockResolvedValue(mockCreatedCollection)

    const result = await createCollection({
      name: "React Patterns",
      description: "Useful React patterns and best practices",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("React Patterns")
      expect(result.data.description).toBe("Useful React patterns and best practices")
    }
    expect(auth).toHaveBeenCalledOnce()
    expect(createCollectionQuery).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "Useful React patterns and best practices",
    })
  })

  it("creates a collection without description", async () => {
    vi.mocked(createCollectionQuery).mockResolvedValue({
      ...mockCreatedCollection,
      name: "Minimal",
      description: null,
    })

    const result = await createCollection({
      name: "Minimal",
      description: null,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Minimal")
      expect(result.data.description).toBeNull()
    }
  })

  it("returns unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await createCollection({
      name: "Test",
      description: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Unauthorized")
    }
  })

  it("validates required name", async () => {
    const result = await createCollection({
      name: "",
      description: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toEqual({ name: ["Name is required"] })
    }
  })

  it("validates description max length", async () => {
    const result = await createCollection({
      name: "Test",
      description: "a".repeat(501),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toEqual({ description: ["Description must be under 500 characters"] })
    }
  })

  it("returns error when createCollectionQuery fails", async () => {
    vi.mocked(createCollectionQuery).mockRejectedValue(new Error("DB error"))

    const result = await createCollection({
      name: "Test",
      description: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Failed to create collection")
    }
  })
})

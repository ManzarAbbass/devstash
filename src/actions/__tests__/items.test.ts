import { describe, it, expect, vi, beforeEach } from "vitest"
import { createItem } from "@/actions/items"

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

const mockCreatedItem = {
  id: "item-new",
  title: "New Snippet",
  contentType: "snippet",
  content: "console.log('hello')",
  description: "A test snippet",
  isFavorite: false,
  isPinned: false,
  language: "javascript",
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  createdAt: new Date(),
  itemTypeId: "type_snippet",
  itemType: { name: "snippet", icon: "Code", color: "#3b82f6" },
  tags: [{ id: "tag-1", name: "javascript" }],
}

vi.mock("@/lib/db/items", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as object),
    createItem: vi.fn(),
  }
})

import { auth } from "@/auth"
import { createItem as createItemQuery } from "@/lib/db/items"

const mockSession = { user: { id: "user-1", email: "test@test.com" } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(mockSession)
})

describe("createItem action", () => {
  it("creates an item successfully", async () => {
    vi.mocked(createItemQuery).mockResolvedValue(mockCreatedItem)

    const result = await createItem({
      title: "New Snippet",
      contentType: "snippet",
      itemTypeId: "type_snippet",
      description: "A test snippet",
      content: "console.log('hello')",
      url: null,
      language: "javascript",
      tags: ["javascript"],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("New Snippet")
      expect(result.data.tags).toEqual([{ id: "tag-1", name: "javascript" }])
    }
    expect(auth).toHaveBeenCalledOnce()
    expect(createItemQuery).toHaveBeenCalledWith("user-1", {
      title: "New Snippet",
      contentType: "snippet",
      itemTypeId: "type_snippet",
      description: "A test snippet",
      content: "console.log('hello')",
      url: null,
      language: "javascript",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      tags: ["javascript"],
    })
  })

  it("returns unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await createItem({
      title: "Test",
      contentType: "snippet",
      itemTypeId: "type_snippet",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Unauthorized")
    }
  })

  it("validates required title", async () => {
    const result = await createItem({
      title: "",
      contentType: "snippet",
      itemTypeId: "type_snippet",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toEqual({ title: ["Title is required"] })
    }
  })

  it("validates url for link type", async () => {
    const result = await createItem({
      title: "My Link",
      contentType: "link",
      itemTypeId: "type_link",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toEqual({ url: ["URL is required for link type"] })
    }
  })

  it("returns error when createItemQuery fails", async () => {
    vi.mocked(createItemQuery).mockRejectedValue(new Error("DB error"))

    const result = await createItem({
      title: "Test",
      contentType: "snippet",
      itemTypeId: "type_snippet",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Failed to create item")
    }
  })

  it("validates malformed url", async () => {
    const result = await createItem({
      title: "My Link",
      contentType: "link",
      itemTypeId: "type_link",
      description: null,
      content: null,
      url: "not-a-url",
      language: null,
      tags: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toEqual({ url: ["Invalid URL"] })
    }
  })
})

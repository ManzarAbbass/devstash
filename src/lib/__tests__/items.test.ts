import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { getItemById } from "@/lib/db/items"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockItem = {
  id: "item-1",
  title: "Custom Hooks",
  contentType: "text",
  content: "some content",
  description: "Reusable hooks",
  isFavorite: true,
  isPinned: false,
  language: "typescript",
  url: null,
  createdAt: new Date(),
  itemTypeId: "type-1",
  userId: "user-1",
  fileUrl: null,
  fileName: null,
  fileSize: null,
  updatedAt: new Date(),
  itemType: { name: "snippet", icon: "Code", color: "#3b82f6" },
  tags: [
    { tag: { id: "tag-1", name: "react" } },
    { tag: { id: "tag-2", name: "hooks" } },
  ],
}

describe("getItemById", () => {
  it("returns the item when found", async () => {
    vi.mocked(prisma.item.findUnique).mockResolvedValue(mockItem)

    const result = await getItemById("user-1", "item-1")

    expect(result).not.toBeNull()
    expect(result!.id).toBe("item-1")
    expect(result!.title).toBe("Custom Hooks")
    expect(result!.description).toBe("Reusable hooks")
    expect(result!.tags).toEqual([
      { id: "tag-1", name: "react" },
      { id: "tag-2", name: "hooks" },
    ])
    expect(prisma.item.findUnique).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      include: {
        itemType: { select: { name: true, icon: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    })
  })

  it("returns null when item does not exist", async () => {
    vi.mocked(prisma.item.findUnique).mockResolvedValue(null)

    const result = await getItemById("user-1", "nonexistent")

    expect(result).toBeNull()
  })

  it("returns null when item belongs to another user", async () => {
    vi.mocked(prisma.item.findUnique).mockResolvedValue(null)

    const result = await getItemById("user-2", "item-1")

    expect(result).toBeNull()
    expect(prisma.item.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-2" }),
      }),
    )
  })

  it("maps tags correctly when empty", async () => {
    vi.mocked(prisma.item.findUnique).mockResolvedValue({
      ...mockItem,
      tags: [],
    })

    const result = await getItemById("user-1", "item-1")

    expect(result!.tags).toEqual([])
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { getSearchData } from "@/lib/db/search"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockItem = {
  id: "item-1",
  title: "Custom Hooks",
  content: "useEffect and useState patterns",
  itemType: { name: "snippet", icon: "Code", color: "#3b82f6" },
}

const mockCollection = {
  id: "col-1",
  name: "React Patterns",
  _count: { items: 5 },
}

describe("getSearchData", () => {
  it("returns items and collections", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([mockItem])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([mockCollection])

    const result = await getSearchData("user-1")

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toEqual({
      id: "item-1",
      title: "Custom Hooks",
      type: { name: "snippet", icon: "Code", color: "#3b82f6" },
      contentPreview: "useEffect and useState patterns",
    })
    expect(result.collections).toHaveLength(1)
    expect(result.collections[0]).toEqual({
      id: "col-1",
      name: "React Patterns",
      itemCount: 5,
    })
  })

  it("returns empty arrays when user has no data", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([])

    const result = await getSearchData("user-1")

    expect(result.items).toEqual([])
    expect(result.collections).toEqual([])
  })

  it("truncates content preview when longer than 100 characters", async () => {
    const longContent = "a".repeat(150)
    vi.mocked(prisma.item.findMany).mockResolvedValue([
      { ...mockItem, content: longContent },
    ])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([])

    const result = await getSearchData("user-1")

    expect(result.items[0].contentPreview).toBe("a".repeat(100) + "...")
  })

  it("returns null contentPreview when content is null", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([
      { ...mockItem, content: null },
    ])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([])

    const result = await getSearchData("user-1")

    expect(result.items[0].contentPreview).toBeNull()
  })

  it("returns null contentPreview when content is empty string", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([
      { ...mockItem, content: "" },
    ])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([])

    const result = await getSearchData("user-1")

    expect(result.items[0].contentPreview).toBeNull()
  })

  it("queries items with correct select and order", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([])

    await getSearchData("user-1")

    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: {
        id: true,
        title: true,
        content: true,
        itemType: { select: { name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  })

  it("queries collections with correct select and order", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([])
    vi.mocked(prisma.collection.findMany).mockResolvedValue([])

    await getSearchData("user-1")

    expect(prisma.collection.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  })

  it("propagates prisma errors", async () => {
    vi.mocked(prisma.item.findMany).mockRejectedValue(new Error("Database error"))

    await expect(getSearchData("user-1")).rejects.toThrow("Database error")
  })
})

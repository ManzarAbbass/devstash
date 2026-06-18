import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { getItemById, createItem, updateItem, deleteItem } from "@/lib/db/items"

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

describe("updateItem", () => {
  const mockUpdatedItem = {
    id: "item-1",
    title: "Updated Title",
    contentType: "text",
    content: "updated content",
    description: "Updated description",
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
      { tag: { id: "tag-3", name: "react-native" } },
    ],
  }

  it("updates an item and returns it with mapped tags", async () => {
    vi.mocked(prisma.item.update).mockResolvedValue(mockUpdatedItem)

    const result = await updateItem("user-1", "item-1", {
      title: "Updated Title",
      description: "Updated description",
      content: "updated content",
      url: null,
      language: "typescript",
      tags: ["react-native"],
    })

    expect(result.id).toBe("item-1")
    expect(result.title).toBe("Updated Title")
    expect(result.tags).toEqual([{ id: "tag-3", name: "react-native" }])
    expect(prisma.item.update).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      data: {
        title: "Updated Title",
        description: "Updated description",
        content: "updated content",
        url: null,
        language: "typescript",
        tags: {
          deleteMany: {},
          create: [
            {
              tag: {
                connectOrCreate: {
                  where: { name: "react-native" },
                  create: { name: "react-native" },
                },
              },
            },
          ],
        },
      },
      include: {
        itemType: { select: { name: true, icon: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    })
  })

  it("deletes old tags and creates new ones", async () => {
    vi.mocked(prisma.item.update).mockResolvedValue(mockUpdatedItem)

    await updateItem("user-1", "item-1", {
      title: "Title",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ["new-tag-1", "new-tag-2"],
    })

    expect(prisma.item.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tags: {
            deleteMany: {},
            create: [
              expect.objectContaining({
                tag: expect.objectContaining({
                  connectOrCreate: { where: { name: "new-tag-1" }, create: { name: "new-tag-1" } },
                }),
              }),
              expect.objectContaining({
                tag: expect.objectContaining({
                  connectOrCreate: { where: { name: "new-tag-2" }, create: { name: "new-tag-2" } },
                }),
              }),
            ],
          },
        }),
      }),
    )
  })

  it("propagates error when item is not found", async () => {
    vi.mocked(prisma.item.update).mockRejectedValue(new Error("Record not found"))

    await expect(
      updateItem("user-1", "nonexistent", {
        title: "Title",
        description: null,
        content: null,
        url: null,
        language: null,
        tags: [],
      }),
    ).rejects.toThrow("Record not found")
  })
})

describe("createItem", () => {
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
    createdAt: new Date(),
    itemTypeId: "type_snippet",
    userId: "user-1",
    fileUrl: null,
    fileName: null,
    fileSize: null,
    updatedAt: new Date(),
    itemType: { name: "snippet", icon: "Code", color: "#3b82f6" },
    tags: [
      { tag: { id: "tag-1", name: "javascript" } },
    ],
  }

  it("creates an item with tags and returns mapped result", async () => {
    vi.mocked(prisma.item.create).mockResolvedValue(mockCreatedItem)

    const result = await createItem("user-1", {
      title: "New Snippet",
      contentType: "snippet",
      itemTypeId: "type_snippet",
      description: "A test snippet",
      content: "console.log('hello')",
      url: null,
      language: "javascript",
      tags: ["javascript"],
    })

    expect(result.id).toBe("item-new")
    expect(result.title).toBe("New Snippet")
    expect(result.tags).toEqual([{ id: "tag-1", name: "javascript" }])
    expect(prisma.item.create).toHaveBeenCalledWith({
      data: {
        title: "New Snippet",
        contentType: "snippet",
        itemTypeId: "type_snippet",
        description: "A test snippet",
        content: "console.log('hello')",
        url: null,
        language: "javascript",
        userId: "user-1",
        tags: {
          create: [
            {
              tag: {
                connectOrCreate: {
                  where: { name: "javascript" },
                  create: { name: "javascript" },
                },
              },
            },
          ],
        },
      },
      include: {
        itemType: { select: { name: true, icon: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    })
  })

  it("creates an item with null optionals", async () => {
    vi.mocked(prisma.item.create).mockResolvedValue({
      ...mockCreatedItem,
      title: "Minimal Item",
      content: null,
      description: null,
      language: null,
      url: null,
      tags: [],
    })

    const result = await createItem("user-1", {
      title: "Minimal Item",
      contentType: "note",
      itemTypeId: "type_note",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(result.title).toBe("Minimal Item")
    expect(result.tags).toEqual([])
  })

  it("creates a link item with url", async () => {
    vi.mocked(prisma.item.create).mockResolvedValue({
      ...mockCreatedItem,
      title: "Example Link",
      contentType: "link",
      content: null,
      language: null,
      url: "https://example.com",
      itemTypeId: "type_link",
      itemType: { name: "link", icon: "Link", color: "#10b981" },
    })

    const result = await createItem("user-1", {
      title: "Example Link",
      contentType: "link",
      itemTypeId: "type_link",
      description: null,
      content: null,
      url: "https://example.com",
      language: null,
      tags: [],
    })

    expect(result.url).toBe("https://example.com")
    expect(prisma.item.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ url: "https://example.com" }),
      }),
    )
  })

  it("propagates prisma errors", async () => {
    vi.mocked(prisma.item.create).mockRejectedValue(new Error("Database error"))

    await expect(
      createItem("user-1", {
        title: "Fail",
        contentType: "snippet",
        itemTypeId: "type_snippet",
        description: null,
        content: null,
        url: null,
        language: null,
        tags: [],
      }),
    ).rejects.toThrow("Database error")
  })
})

describe("deleteItem", () => {
  it("deletes an item successfully", async () => {
    vi.mocked(prisma.item.delete).mockResolvedValue(mockItem as any)

    await deleteItem("user-1", "item-1")

    expect(prisma.item.delete).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
    })
  })

  it("throws when item does not exist", async () => {
    vi.mocked(prisma.item.delete).mockRejectedValue(new Error("Record not found"))

    await expect(deleteItem("user-1", "nonexistent")).rejects.toThrow("Record not found")
  })

  it("throws when item belongs to another user", async () => {
    vi.mocked(prisma.item.delete).mockRejectedValue(new Error("Record not found"))

    await expect(deleteItem("user-2", "item-1")).rejects.toThrow("Record not found")

    expect(prisma.item.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-2" }),
      }),
    )
  })
})

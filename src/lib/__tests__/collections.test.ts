import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { createCollection } from "@/lib/db/collections"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockCollection = {
  id: "col-1",
  name: "React Patterns",
  description: "Useful React patterns and best practices",
  isFavorite: false,
  defaultTypeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-1",
}

describe("createCollection", () => {
  it("creates a collection with name and description", async () => {
    vi.mocked(prisma.collection.create).mockResolvedValue(mockCollection)

    const result = await createCollection("user-1", {
      name: "React Patterns",
      description: "Useful React patterns and best practices",
    })

    expect(result.id).toBe("col-1")
    expect(result.name).toBe("React Patterns")
    expect(result.description).toBe("Useful React patterns and best practices")
    expect(prisma.collection.create).toHaveBeenCalledWith({
      data: {
        name: "React Patterns",
        description: "Useful React patterns and best practices",
        userId: "user-1",
      },
    })
  })

  it("creates a collection without description", async () => {
    vi.mocked(prisma.collection.create).mockResolvedValue({
      ...mockCollection,
      name: "Untitled",
      description: null,
    })

    const result = await createCollection("user-1", {
      name: "Untitled",
      description: null,
    })

    expect(result.name).toBe("Untitled")
    expect(result.description).toBeNull()
    expect(prisma.collection.create).toHaveBeenCalledWith({
      data: {
        name: "Untitled",
        description: null,
        userId: "user-1",
      },
    })
  })

  it("propagates prisma errors", async () => {
    vi.mocked(prisma.collection.create).mockRejectedValue(new Error("Database error"))

    await expect(
      createCollection("user-1", {
        name: "Fail",
        description: null,
      }),
    ).rejects.toThrow("Database error")
  })
})

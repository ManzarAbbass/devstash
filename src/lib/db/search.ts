import { prisma } from "@/lib/prisma"

export interface SearchItem {
  id: string
  title: string
  type: { name: string; icon: string; color: string }
  contentPreview: string | null
}

export interface SearchCollection {
  id: string
  name: string
  itemCount: number
}

export interface SearchData {
  items: SearchItem[]
  collections: SearchCollection[]
}

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        itemType: { select: { name: true, icon: true, color: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    }),
    prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.itemType,
      contentPreview: item.content
        ? item.content.length > 100
          ? item.content.slice(0, 100) + "..."
          : item.content
        : null,
    })),
    collections: collections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    })),
  }
}

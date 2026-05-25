import { prisma } from "@/lib/prisma"

export interface ItemWithDetails {
  id: string
  title: string
  contentType: string
  content: string | null
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  language: string | null
  url: string | null
  createdAt: Date
  itemTypeId: string
  itemType: {
    name: string
    icon: string
    color: string
  }
  tags: { id: string; name: string }[]
}

export async function getPinnedItems(userId: string): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    content: item.content,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    language: item.language,
    url: item.url,
    createdAt: item.createdAt,
    itemTypeId: item.itemTypeId,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag),
  }))
}

export async function getRecentItems(userId: string): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    content: item.content,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    language: item.language,
    url: item.url,
    createdAt: item.createdAt,
    itemTypeId: item.itemTypeId,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag),
  }))
}

export async function getItemStats(userId: string): Promise<{ totalItems: number; favoriteItems: number }> {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ])
  return { totalItems, favoriteItems }
}

export interface ItemTypeWithCount {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

const typeOrder = ["snippet", "prompt", "command", "note", "file", "image", "link"]

export async function getItemTypeCounts(userId: string): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({
    where: { OR: [{ isSystem: true }, { userId }] },
    include: {
      _count: { select: { items: { where: { userId } } } },
    },
  })

  return types
    .map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    }))
    .sort((a, b) => {
      const ai = typeOrder.indexOf(a.name)
      const bi = typeOrder.indexOf(b.name)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
}

export interface SidebarData {
  user: {
    name: string
    email: string
    image: string | null
  }
  itemTypes: ItemTypeWithCount[]
  favoriteCollections: { id: string; name: string; dominantTypeColor: string | null }[]
  recentCollections: { id: string; name: string; createdAt: Date; dominantTypeColor: string | null }[]
}

async function getSidebarCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: { select: { color: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return collections.map((col) => {
    const colorCounts = new Map<string, number>()
    for (const ic of col.items) {
      const color = ic.item.itemType.color
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1)
    }
    let dominantTypeColor: string | null = null
    let maxCount = 0
    for (const [color, count] of colorCounts) {
      if (count > maxCount) {
        maxCount = count
        dominantTypeColor = color
      }
    }
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      createdAt: col.createdAt,
      dominantTypeColor,
    }
  })
}

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [user, itemTypes, collections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true },
    }),
    getItemTypeCounts(userId),
    getSidebarCollections(userId),
  ])

  if (!user) throw new Error("User not found")

  return {
    user: {
      name: user.name ?? "User",
      email: user.email ?? "",
      image: user.image,
    },
    itemTypes,
    favoriteCollections: collections.filter((c) => c.isFavorite).map(({ id, name, dominantTypeColor }) => ({ id, name, dominantTypeColor })),
    recentCollections: collections.filter((c) => !c.isFavorite),
  }
}

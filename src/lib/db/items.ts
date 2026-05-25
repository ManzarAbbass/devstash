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

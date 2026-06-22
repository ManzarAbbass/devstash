import { prisma } from "@/lib/prisma"

export interface CreateItemData {
  title: string
  contentType: string
  itemTypeId: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  tags: string[]
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  collectionIds?: string[]
}

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
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: Date
  itemTypeId: string
  itemType: {
    name: string
    icon: string
    color: string
  }
  tags: { id: string; name: string }[]
}

function formatItem(item: {
  id: string
  title: string
  contentType: string
  content: string | null
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  language: string | null
  url: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: Date
  itemTypeId: string
  itemType: { name: string; icon: string; color: string }
  tags: { tag: { id: string; name: string } }[]
}): ItemWithDetails {
  return {
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    content: item.content,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    createdAt: item.createdAt,
    itemTypeId: item.itemTypeId,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag),
  }
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

  return items.map(formatItem)
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

  return items.map(formatItem)
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
  const [collections, aggregation, itemTypes] = await Promise.all([
    prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.$queryRaw<
      { collection_id: string; item_type_id: string; count: number }[]
    >`
      SELECT
        ic."collectionId" AS collection_id,
        i."itemTypeId" AS item_type_id,
        COUNT(*)::int AS count
      FROM "ItemCollection" ic
      JOIN "Item" i ON i."id" = ic."itemId"
      JOIN "Collection" c ON c."id" = ic."collectionId"
      WHERE c."userId" = ${userId}
      GROUP BY ic."collectionId", i."itemTypeId"
    `,
    prisma.itemType.findMany({ select: { id: true, color: true } }),
  ])

  const typeColorMap = new Map(itemTypes.map((t) => [t.id, t.color]))

  const aggByCollection = new Map<string, Map<string, number>>()
  for (const row of aggregation) {
    let typeCounts = aggByCollection.get(row.collection_id)
    if (!typeCounts) {
      typeCounts = new Map()
      aggByCollection.set(row.collection_id, typeCounts)
    }
    typeCounts.set(row.item_type_id, row.count)
  }

  return collections.map((col) => {
    const typeCounts = aggByCollection.get(col.id)
    let dominantTypeColor: string | null = null
    let maxCount = 0
    if (typeCounts) {
      for (const [typeId, count] of typeCounts) {
        const color = typeColorMap.get(typeId)
        if (color && count > maxCount) {
          maxCount = count
          dominantTypeColor = color
        }
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

export async function updateItem(
  userId: string,
  itemId: string,
  data: {
    title: string
    description: string | null
    content: string | null
    url: string | null
    language: string | null
    tags: string[]
    collectionIds?: string[]
  }
): Promise<ItemWithDetails> {
  const item = await prisma.item.update({
    where: { id: itemId, userId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: data.collectionIds?.map((collectionId) => ({
          collectionId,
        })) ?? [],
      },
    },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
  })

  return formatItem(item)
}

export async function createItem(
  userId: string,
  data: CreateItemData
): Promise<ItemWithDetails> {
  const item = await prisma.item.create({
    data: {
      title: data.title,
      contentType: data.contentType,
      itemTypeId: data.itemTypeId,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      userId,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: data.collectionIds?.length
        ? {
            create: data.collectionIds.map((collectionId) => ({
              collectionId,
            })),
          }
        : undefined,
    },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
  })

  return formatItem(item)
}

export async function getItemCollectionIds(userId: string, itemId: string): Promise<string[]> {
  const collections = await prisma.itemCollection.findMany({
    where: { item: { userId, id: itemId } },
    select: { collectionId: true },
  })
  return collections.map((c) => c.collectionId)
}

export async function getItemById(
  userId: string,
  itemId: string
): Promise<ItemWithDetails | null> {
  const item = await prisma.item.findUnique({
    where: { id: itemId, userId },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
  })

  if (!item) return null

  return formatItem(item)
}

export async function getItemsByCollection(userId: string, collectionId: string): Promise<ItemWithDetails[]> {
  const itemCollections = await prisma.itemCollection.findMany({
    where: { collectionId, item: { userId } },
    include: {
      item: {
        include: {
          itemType: { select: { name: true, icon: true, color: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { item: { createdAt: "desc" } },
  })

  return itemCollections.map((ic) => formatItem(ic.item))
}

export async function getItemsByType(userId: string, typeName: string): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: { userId, itemType: { name: typeName } },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return items.map(formatItem)
}

export async function deleteItem(userId: string, itemId: string): Promise<{ fileUrl: string | null }> {
  const item = await prisma.item.delete({
    where: { id: itemId, userId },
    select: { fileUrl: true },
  })

  return { fileUrl: item.fileUrl }
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

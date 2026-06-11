import { prisma } from "@/lib/prisma"

export interface CollectionWithStats {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  defaultTypeId: string | null
  createdAt: Date
  itemCount: number
  dominantType: { name: string; icon: string; color: string } | null
  typeIcons: { name: string; icon: string; color: string }[]
}

export async function getCollections(userId: string): Promise<CollectionWithStats[]> {
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
    prisma.itemType.findMany(),
  ])

  const typeMap = new Map(itemTypes.map((t) => [t.id, t]))

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
    const typeCounts = aggByCollection.get(col.id) ?? new Map()
    const sorted = [...typeCounts.entries()]
      .map(([typeId, count]) => {
        const type = typeMap.get(typeId)
        if (!type) return null
        return { count, name: type.name, icon: type.icon, color: type.color }
      })
      .filter((t): t is NonNullable<typeof t> => t !== null)
      .sort((a, b) => b.count - a.count)

    const itemCount = sorted.reduce((sum, t) => sum + t.count, 0)
    const dominantType = sorted.length > 0 ? sorted[0] : null

    const typeIcons = sorted.map((t) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
    }))

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      defaultTypeId: col.defaultTypeId,
      createdAt: col.createdAt,
      itemCount,
      dominantType: dominantType
        ? { name: dominantType.name, icon: dominantType.icon, color: dominantType.color }
        : null,
      typeIcons,
    }
  })
}



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
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return collections.map((col) => {
    const items = col.items.map((ic) => ic.item)
    const typeCounts = new Map<string, { count: number; name: string; icon: string; color: string }>()

    for (const item of items) {
      const existing = typeCounts.get(item.itemTypeId)
      if (existing) {
        existing.count++
      } else {
        typeCounts.set(item.itemTypeId, {
          count: 1,
          name: item.itemType.name,
          icon: item.itemType.icon,
          color: item.itemType.color,
        })
      }
    }

    const sorted = [...typeCounts.entries()].sort((a, b) => b[1].count - a[1].count)
    const dominantType = sorted.length > 0 ? sorted[0][1] : null

    const typeIcons = [...typeCounts.values()].map((t) => ({
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
      itemCount: items.length,
      dominantType: dominantType
        ? { name: dominantType.name, icon: dominantType.icon, color: dominantType.color }
        : null,
      typeIcons,
    }
  })
}

export async function getDemoUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: "john@example.com" },
    select: { id: true },
  })
  if (!user) throw new Error("Demo user not found. Run `npx tsx prisma/seed.ts` first.")
  return user.id
}

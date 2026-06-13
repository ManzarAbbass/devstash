import { prisma } from "@/lib/prisma"

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: Date
  hasPassword: boolean
}

export interface ProfileStats {
  totalItems: number
  totalCollections: number
  itemTypeBreakdown: { name: string; icon: string; color: string; count: number }[]
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  })

  if (!user) throw new Error("User not found")

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: user.password !== null,
  }
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypeAgg] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.$queryRaw<{ itemTypeId: string; count: number }[]>`
      SELECT "itemTypeId", COUNT(*)::int AS count
      FROM "Item"
      WHERE "userId" = ${userId}
      GROUP BY "itemTypeId"
    `,
  ])

  const itemTypeIds = itemTypeAgg.map((r) => r.itemTypeId)
  const itemTypes = await prisma.itemType.findMany({
    where: { id: { in: itemTypeIds } },
    select: { id: true, name: true, icon: true, color: true },
  })

  const typeMap = new Map(itemTypes.map((t) => [t.id, t]))
  const itemTypeBreakdown = itemTypeAgg.map((r) => {
    const t = typeMap.get(r.itemTypeId)
    return {
      name: t?.name ?? "Unknown",
      icon: t?.icon ?? "Code",
      color: t?.color ?? "#888",
      count: r.count,
    }
  })

  return { totalItems, totalCollections, itemTypeBreakdown }
}

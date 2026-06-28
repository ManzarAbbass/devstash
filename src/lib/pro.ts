import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FREE_TIER_MAX_ITEMS, FREE_TIER_MAX_COLLECTIONS } from "@/lib/constants"

export type ProCheckResult = { allowed: true } | { allowed: false; reason: string }

export async function getProStatus(): Promise<boolean> {
  const session = await auth()
  return session?.user?.isPro ?? false
}

export async function checkItemLimit(userId: string, isPro: boolean): Promise<ProCheckResult> {
  if (isPro) return { allowed: true }

  const count = await prisma.item.count({
    where: { userId },
  })

  if (count >= FREE_TIER_MAX_ITEMS) {
    return {
      allowed: false,
      reason: `You've reached the free tier limit of ${FREE_TIER_MAX_ITEMS} items. Upgrade to Pro for unlimited items.`,
    }
  }

  return { allowed: true }
}

export async function checkCollectionLimit(userId: string, isPro: boolean): Promise<ProCheckResult> {
  if (isPro) return { allowed: true }

  const count = await prisma.collection.count({
    where: { userId },
  })

  if (count >= FREE_TIER_MAX_COLLECTIONS) {
    return {
      allowed: false,
      reason: `You've reached the free tier limit of ${FREE_TIER_MAX_COLLECTIONS} collections. Upgrade to Pro for unlimited collections.`,
    }
  }

  return { allowed: true }
}

export function checkFileUploadAllowed(isPro: boolean): ProCheckResult {
  if (isPro) return { allowed: true }

  return {
    allowed: false,
    reason: "File uploads are a Pro feature. Upgrade to unlock.",
  }
}

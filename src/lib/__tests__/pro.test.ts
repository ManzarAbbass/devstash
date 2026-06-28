import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { getProStatus, checkItemLimit, checkCollectionLimit, checkFileUploadAllowed } from "@/lib/pro"
import { FREE_TIER_MAX_ITEMS, FREE_TIER_MAX_COLLECTIONS } from "@/lib/constants"

const mockAuth = vi.fn()

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getProStatus", () => {
  it("returns false when no session exists", async () => {
    mockAuth.mockResolvedValue(null)

    const result = await getProStatus()
    expect(result).toBe(false)
  })

  it("returns session.user.isPro when present", async () => {
    mockAuth.mockResolvedValue({ user: { isPro: true } })

    const result = await getProStatus()
    expect(result).toBe(true)
  })

  it("returns false when isPro is false in session", async () => {
    mockAuth.mockResolvedValue({ user: { isPro: false } })

    const result = await getProStatus()
    expect(result).toBe(false)
  })
})

describe("checkItemLimit", () => {
  it("free user within item limit returns allowed: true", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(FREE_TIER_MAX_ITEMS - 1)

    const result = await checkItemLimit("user-1", false)
    expect(result).toEqual({ allowed: true })
    expect(prisma.item.count).toHaveBeenCalledWith({ where: { userId: "user-1" } })
  })

  it("free user at item limit returns allowed: false", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(FREE_TIER_MAX_ITEMS)

    const result = await checkItemLimit("user-1", false)
    expect(result).toEqual({ allowed: false, reason: expect.any(String) })
  })

  it("pro user always passes item limit check", async () => {
    const result = await checkItemLimit("user-1", true)
    expect(result).toEqual({ allowed: true })
    expect(prisma.item.count).not.toHaveBeenCalled()
  })
})

describe("checkCollectionLimit", () => {
  it("free user within collection limit returns allowed: true", async () => {
    vi.mocked(prisma.collection.count).mockResolvedValue(FREE_TIER_MAX_COLLECTIONS - 1)

    const result = await checkCollectionLimit("user-1", false)
    expect(result).toEqual({ allowed: true })
    expect(prisma.collection.count).toHaveBeenCalledWith({ where: { userId: "user-1" } })
  })

  it("free user at collection limit returns allowed: false", async () => {
    vi.mocked(prisma.collection.count).mockResolvedValue(FREE_TIER_MAX_COLLECTIONS)

    const result = await checkCollectionLimit("user-1", false)
    expect(result).toEqual({ allowed: false, reason: expect.any(String) })
  })

  it("pro user always passes collection limit check", async () => {
    const result = await checkCollectionLimit("user-1", true)
    expect(result).toEqual({ allowed: true })
    expect(prisma.collection.count).not.toHaveBeenCalled()
  })
})

describe("checkFileUploadAllowed", () => {
  it("free user fails file upload check", () => {
    const result = checkFileUploadAllowed(false)
    expect(result).toEqual({ allowed: false, reason: expect.any(String) })
  })

  it("pro user always passes file upload check", () => {
    const result = checkFileUploadAllowed(true)
    expect(result).toEqual({ allowed: true })
  })
})

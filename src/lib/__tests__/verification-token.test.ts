import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { createVerificationToken, verifyEmailToken } from "@/lib/verification-token"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("createVerificationToken", () => {
  it("creates a token and returns it", async () => {
    vi.mocked(prisma.verificationToken.create).mockResolvedValue({
      identifier: "test@example.com",
      token: "uuid-token",
      expires: new Date(),
    })

    const token = await createVerificationToken("test@example.com")

    expect(token).toBeDefined()
    expect(typeof token).toBe("string")
    expect(prisma.verificationToken.create).toHaveBeenCalledOnce()
    expect(prisma.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: "test@example.com",
        }),
      }),
    )
  })
})

describe("verifyEmailToken", () => {
  it("returns invalid when token does not exist", async () => {
    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(null)

    const result = await verifyEmailToken("nonexistent")

    expect(result).toEqual({ valid: false, reason: "invalid" })
  })

  it("returns expired when token is past expiry", async () => {
    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue({
      identifier: "test@example.com",
      token: "old-token",
      expires: new Date(Date.now() - 1000),
    })

    const result = await verifyEmailToken("old-token")

    expect(result).toEqual({ valid: false, reason: "expired" })
  })

  it("verifies and deletes token on success", async () => {
    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue({
      identifier: "test@example.com",
      token: "valid-token",
      expires: new Date(Date.now() + 10000),
    })
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)
    vi.mocked(prisma.verificationToken.delete).mockResolvedValue({} as any)

    const result = await verifyEmailToken("valid-token")

    expect(result).toEqual({ valid: true, reason: null })
    expect(prisma.user.update).toHaveBeenCalledOnce()
    expect(prisma.verificationToken.delete).toHaveBeenCalledOnce()
  })
})

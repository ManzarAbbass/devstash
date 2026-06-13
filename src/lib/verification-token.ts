import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function createVerificationToken(email: string) {
  const token = randomUUID()

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  })

  return token
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record) return { valid: false, reason: "invalid" as const }
  if (record.expires < new Date()) return { valid: false, reason: "expired" as const }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({ where: { token } })

  return { valid: true, reason: null }
}

export async function createPasswordResetToken(email: string) {
  const token = randomUUID()

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  })

  return token
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record) return { valid: false, reason: "invalid" as const }
  if (record.expires < new Date()) return { valid: false, reason: "expired" as const }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { email: record.identifier },
    data: { password: hashedPassword },
  })

  await prisma.verificationToken.delete({ where: { token } })

  return { valid: true, reason: null }
}

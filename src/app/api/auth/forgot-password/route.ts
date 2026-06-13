import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPasswordResetToken } from "@/lib/verification-token"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, name: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: "If that email is registered, you will receive a password reset link." },
        { status: 200 },
      )
    }

    const token = await createPasswordResetToken(email)
    const origin = new URL(request.url).origin
    await sendPasswordResetEmail({ email, name: user.name, token, origin })

    return NextResponse.json(
      { message: "If that email is registered, you will receive a password reset link." },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createVerificationToken } from "@/lib/verification-token"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const emailVerificationEnabled = process.env.EMAIL_VERIFICATION !== "false"

    await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        emailVerified: emailVerificationEnabled ? null : new Date(),
      },
    })

    if (emailVerificationEnabled) {
      const token = await createVerificationToken(email)
      const origin = new URL(request.url).origin
      await sendVerificationEmail({ email, name: name || null, token, origin })
    }

    return NextResponse.json(
      {
        message: emailVerificationEnabled
          ? "Account created. Check your email for the verification link."
          : "Account created! You can now sign in.",
        verified: !emailVerificationEnabled,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

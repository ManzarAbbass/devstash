import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (user?.password) {
      if (!password) {
        return NextResponse.json({ error: "Password is required to delete account" }, { status: 400 })
      }
      const bcrypt = await import("bcryptjs")
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json({ error: "Password is incorrect" }, { status: 400 })
      }
    }

    await prisma.user.delete({ where: { id: session.user.id } })

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

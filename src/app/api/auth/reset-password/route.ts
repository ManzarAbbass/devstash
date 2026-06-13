import { NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/verification-token"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      )
    }

    const result = await resetPasswordWithToken(token, password)

    if (!result.valid) {
      const message =
        result.reason === "expired"
          ? "This reset link has expired. Please request a new one."
          : "Invalid reset link"

      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Password reset successfully! You can now sign in." },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
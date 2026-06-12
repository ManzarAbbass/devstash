import { NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/verification-token"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?status=error&message=Missing verification token", request.url))
  }

  const result = await verifyEmailToken(token)

  if (!result.valid) {
    if (result.reason === "expired") {
      return NextResponse.redirect(new URL("/verify-email?status=error&message=This verification link has expired. Please register again.", request.url))
    }
    return NextResponse.redirect(new URL("/verify-email?status=error&message=Invalid verification link", request.url))
  }

  return NextResponse.redirect(new URL("/verify-email?status=success", request.url))
}

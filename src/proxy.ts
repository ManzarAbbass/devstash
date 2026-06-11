import { auth } from "./auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  if (!req.auth?.user) {
    const signInUrl = new URL("/api/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*"],
}

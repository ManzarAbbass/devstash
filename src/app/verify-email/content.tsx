"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const message = searchParams.get("message")

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />

      <Card className="relative w-full max-w-sm">
        {status === "success" ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="size-6" />
              </div>
              <CardTitle className="text-xl">Email verified!</CardTitle>
              <CardDescription>
                Your email has been verified. You can now sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Sign in
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="size-6" />
              </div>
              <CardTitle className="text-xl">Verification failed</CardTitle>
              <CardDescription>
                {message || "Something went wrong. Please try again."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/register"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Register again
              </Link>
            </CardContent>
          </>
        )}

        <CardFooter className="justify-center">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, MailCheck } from "lucide-react"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Email is required")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      toast.error(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    setSent(true)
    toast.success("Reset link sent if email is registered")
  }

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />

        <Card className="relative w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-purple-600/10 text-purple-400">
              <MailCheck className="size-6" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              If an account exists for{" "}
              <span className="font-medium text-foreground">{email}</span>,
              we&apos;ve sent a password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              The link expires in 1 hour. If you don&apos;t see it, check your spam folder.
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/sign-in" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--muted-foreground)/0.04),transparent_50%)]" />

      <Card className="relative w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
            D
          </div>
          <CardTitle className="text-xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/sign-in" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, CheckCircle, XCircle } from "lucide-react"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [failed, setFailed] = useState(false)
  const [failReason, setFailReason] = useState("")

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />

        <Card className="relative w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="size-6" />
            </div>
            <CardTitle className="text-xl">Invalid reset link</CardTitle>
            <CardDescription>
              This password reset link is missing or invalid.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <Link
              href="/forgot-password"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Request new link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      if (res.status === 400) {
        setFailed(true)
        setFailReason(data.error || "Something went wrong")
      } else {
        setError(data.error || "Something went wrong")
        toast.error(data.error || "Something went wrong")
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    toast.success("Password reset successfully!")
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />

        <Card className="relative w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="size-6" />
            </div>
            <CardTitle className="text-xl">Password reset!</CardTitle>
            <CardDescription>
              Your password has been updated successfully.
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
        </Card>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />

        <Card className="relative w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="size-6" />
            </div>
            <CardTitle className="text-xl">Reset link invalid</CardTitle>
            <CardDescription>{failReason}</CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <Link
              href="/forgot-password"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Request new link
            </Link>
          </CardContent>
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
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
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
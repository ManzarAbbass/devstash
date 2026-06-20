import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusCard } from "@/components/ui/status-card"

export function ResetPasswordNoToken() {
  return (
    <StatusCard
      iconWrapper={
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-6" />
        </div>
      }
      title="Invalid reset link"
      description="This password reset link is missing or invalid."
      action={
        <Link
          href="/forgot-password"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Request new link
        </Link>
      }
    />
  )
}

export function ResetPasswordSuccess() {
  return (
    <StatusCard
      iconWrapper={
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="size-6" />
        </div>
      }
      title="Password reset!"
      description="Your password has been updated successfully."
      action={
        <Link
          href="/sign-in"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Sign in
        </Link>
      }
    />
  )
}

export function ResetPasswordFailed({ failReason }: { failReason: string }) {
  return (
    <StatusCard
      iconWrapper={
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-6" />
        </div>
      }
      title="Reset link invalid"
      description={failReason}
      action={
        <Link
          href="/forgot-password"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Request new link
        </Link>
      }
    />
  )
}

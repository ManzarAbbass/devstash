import Link from "next/link"
import { MailCheck, CheckCircle } from "lucide-react"
import { StatusCard } from "@/components/ui/status-card"

interface RegisterSuccessProps {
  verified: boolean
  email: string
}

export function RegisterVerified() {
  return (
    <StatusCard
      iconWrapper={
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="size-6" />
        </div>
      }
      title="Account created!"
      description="You can now sign in to your account."
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

export function RegisterEmailSent({ email }: { email: string }) {
  return (
    <StatusCard
      iconWrapper={
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-purple-600/10 text-purple-400">
          <MailCheck className="size-6" />
        </div>
      }
      title="Check your email"
      description={
        <>
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </>
      }
      action={
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            Click the link in the email to activate your account. If you don&apos;t see it, check your spam folder.
          </div>
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
            <Link href="/sign-in" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      }
    />
  )
}

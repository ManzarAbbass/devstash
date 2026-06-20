import { Suspense } from "react"
import { SignInForm } from "./sign-in-form"

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}

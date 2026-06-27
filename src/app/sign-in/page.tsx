import { Suspense } from "react"
import { Nav } from "@/components/homepage/Nav"
import { SignInForm } from "./sign-in-form"

export default function SignInPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </>
  )
}

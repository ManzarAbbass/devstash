import { Suspense } from "react"
import { Nav } from "@/components/homepage/Nav"
import { RegisterForm } from "./register-form"

export default function RegisterPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </>
  )
}

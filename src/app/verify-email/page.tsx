import { Suspense } from "react"
import { VerifyEmailContent } from "./content"

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}

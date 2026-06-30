"use client"

import { useState } from "react"
import { Check, X, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const freeFeatures = [
  { text: "50 items", included: true },
  { text: "3 collections", included: true },
  { text: "All item types (text, url)", included: true },
  { text: "Basic search", included: true },
  { text: "AI features", included: false },
  { text: "File & image uploads", included: false },
  { text: "Unlimited items & collections", included: false },
  { text: "Export data (JSON / ZIP)", included: false },
  { text: "Priority support", included: false },
]

const proFeatures = [
  { text: "Unlimited items", included: true },
  { text: "Unlimited collections", included: true },
  { text: "All item types including file & image", included: true },
  { text: "AI-powered tagging & search", included: true },
  { text: "File & image uploads", included: true },
  { text: "Export data (JSON / ZIP)", included: true },
  { text: "Custom item types (coming soon)", included: true },
  { text: "Priority support", included: true },
]

export function UpgradeContent({
  isPro,
  monthlyPriceId,
  yearlyPriceId,
}: {
  isPro: boolean
  monthlyPriceId: string
  yearlyPriceId: string
}) {
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: yearly ? yearlyPriceId : monthlyPriceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      window.location.href = data.url
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isPro) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-xl border border-border bg-card p-10">
          <Crown className="mx-auto mb-4 size-12 text-yellow-500" />
          <h1 className="mb-2 text-2xl font-bold">You&apos;re on Pro</h1>
          <p className="mb-6 text-muted-foreground">
            You have full access to all features. Manage your subscription in settings.
          </p>
          <Link href="/settings">
            <Button>Manage Subscription</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mb-2 text-center">
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
        <p className="mt-2 text-muted-foreground">
          Unlock unlimited items, AI features, file uploads, and more.
        </p>
      </div>

      <div className="mb-10 mt-8 flex items-center justify-center gap-4">
        <span className={`text-sm font-medium transition-colors ${yearly ? "text-muted-foreground" : "text-foreground"}`}>
          Monthly
        </span>
        <label className="relative inline-block h-7 w-[52px]">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={yearly}
            onChange={(e) => setYearly(e.target.checked)}
          />
          <span className="absolute inset-0 cursor-pointer rounded-full bg-muted transition-colors peer-checked:bg-blue-500" />
          <span className="absolute left-1 bottom-1 size-5 rounded-full bg-white transition-all peer-checked:translate-x-6" />
        </label>
        <span className={`text-sm font-medium transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly{" "}
          <span className="block text-[11px] font-semibold text-green-500">Save 25%</span>
        </span>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Card className="border-border">
          <CardContent className="p-8">
            <h2 className="mb-1 text-xl font-bold">Free</h2>
            <p className="mb-6 text-4xl font-extrabold">
              $0<span className="text-base font-medium text-muted-foreground">/mo</span>
            </p>
            <ul className="mb-8 flex flex-col gap-2.5">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm">
                  {f.included ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground">
              Current Plan
            </div>
          </CardContent>
        </Card>

        <div className="relative pt-4">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-purple-500/30">
            Most Popular
          </div>
          <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-purple-500/40 via-purple-500/20 to-transparent opacity-75 blur-sm" />
          <Card className="relative border-purple-500/60 bg-gradient-to-br from-[#1a1a2e] to-[#1f1f23] shadow-xl shadow-purple-500/10">
            <CardContent className="p-8">
              <h2 className="mb-1 text-xl font-bold">Pro</h2>
              <div className="mb-6">
                {yearly ? (
                  <>
                    <span className="text-4xl font-extrabold">$72</span>
                    <span className="text-base font-medium text-muted-foreground">/yr</span>
                    <span className="ml-2 text-xs font-semibold text-green-500">Save $24</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold">$8</span>
                    <span className="text-base font-medium text-muted-foreground">/mo</span>
                  </>
                )}
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                {proFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                      <Check className="size-3 text-purple-400" />
                    </span>
                    <span className="text-[#d4d4d8]">{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border-0 shadow-lg shadow-purple-500/25"
              >
                <Crown className="size-4" />
                {loading
                  ? "Redirecting..."
                  : `Upgrade to Pro - $${yearly ? "72" : "8"}/${yearly ? "yr" : "mo"}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

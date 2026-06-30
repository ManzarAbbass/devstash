"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { ScrollReveal } from "./ScrollReveal"

export function PricingCards({ monthlyPriceId, yearlyPriceId }: {
  monthlyPriceId: string
  yearlyPriceId: string
}) {
  const [yearly, setYearly] = useState(false)
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 text-center" id="pricing">
      <h2 className="mb-4 text-[clamp(32px,4vw,48px)] font-extrabold">
        Simple, transparent{" "}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          pricing
        </span>
      </h2>
      <p className="mx-auto mb-12 max-w-[560px] text-lg text-[#a1a1aa]">Start free, upgrade when you need more.</p>

      <div className="mb-12 flex items-center justify-center gap-4">
        <span className={`text-sm font-medium transition-colors ${yearly ? "text-[#71717a]" : "text-[#f4f4f5]"}`}>
          Monthly
        </span>
        <label className="relative inline-block h-7 w-[52px]">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={yearly}
            onChange={(e) => setYearly(e.target.checked)}
          />
          <span className="absolute inset-0 cursor-pointer rounded-full bg-[#27272a] transition-colors peer-checked:bg-blue-500" />
          <span className="absolute left-1 bottom-1 size-5 rounded-full bg-white transition-all peer-checked:translate-x-6" />
        </label>
        <span className={`text-sm font-medium transition-colors ${yearly ? "text-[#f4f4f5]" : "text-[#71717a]"}`}>
          Yearly{" "}
          <span className="block text-[11px] font-semibold text-green-500">Save 25%</span>
        </span>
      </div>

      <div className="mx-auto grid max-w-[700px] gap-8 sm:grid-cols-2">
        <ScrollReveal>
          <div className="relative rounded-xl border border-[#27272a] bg-[#1f1f23] p-10 text-left">
            <h3 className="mb-4 text-xl font-bold text-[#f4f4f5]">Free</h3>
            <div className="mb-6 text-4xl font-extrabold text-[#f4f4f5]">
              $0<span className="text-base font-medium text-[#71717a]">/mo</span>
            </div>
            <ul className="mb-8 flex flex-col gap-3">
              {["50 items", "3 collections", "Basic search"].map((item) => (
                <li key={item} className="relative pl-7 text-sm text-[#a1a1aa]">
                  <span className="absolute left-0 text-green-500 font-bold">✓</span>
                  {item}
                </li>
              ))}
              {["AI features", "Unlimited storage"].map((item) => (
                <li key={item} className="relative pl-7 text-sm text-[#71717a]">
                  <span className="absolute left-0 text-[#71717a] font-bold">✗</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex w-full items-center justify-center rounded-lg border border-blue-500/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:border-blue-500 hover:text-blue-300"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative pt-4">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-500/30">
              Most Popular
            </div>
            <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-blue-500/40 via-blue-500/20 to-transparent opacity-75 blur-sm" />
            <div className="relative rounded-xl border border-blue-500/60 bg-gradient-to-br from-[#1f1f23] to-[#1a1a2e] p-10 text-left shadow-xl shadow-blue-500/10">
              <h3 className="mb-4 text-xl font-bold text-[#f4f4f5]">Pro</h3>
              <div className="mb-6">
                {yearly ? (
                  <>
                    <span className="text-4xl font-extrabold text-[#f4f4f5]">$72</span>
                    <span className="text-base font-medium text-[#71717a]">/yr</span>
                    <span className="ml-2 text-xs font-semibold text-green-500">Save $24</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold text-[#f4f4f5]">$8</span>
                    <span className="text-base font-medium text-[#71717a]">/mo</span>
                  </>
                )}
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                {[
                  "Unlimited items",
                  "Unlimited collections",
                  "AI-powered tagging & search",
                  "File & image uploads",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#a1a1aa]">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                      <svg className="size-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ priceId: yearly ? yearlyPriceId : monthlyPriceId }),
                      })
                      const data = await res.json()
                      if (data.url) window.location.href = data.url
                    } catch {}
                  }}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
                >
                  Upgrade to Pro
                </button>
              ) : (
                <a
                  href="/sign-in"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
                >
                  Upgrade to Pro
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { ScrollReveal } from "./ScrollReveal"

export function PricingCards() {
  const [yearly, setYearly] = useState(false)

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
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-lg border border-blue-500/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:border-blue-500 hover:text-blue-300"
            >
              Get Started
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative rounded-xl border border-blue-500 bg-gradient-to-br from-[#1f1f23] to-[#1a1a2e] p-10 text-left">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Most Popular
            </div>
            <h3 className="mb-4 text-xl font-bold text-[#f4f4f5]">Pro</h3>
            <div className="mb-6 text-4xl font-extrabold text-[#f4f4f5]">
              <span>${yearly ? "6" : "8"}</span>
              <span className="text-base font-medium text-[#71717a]">/mo</span>
            </div>
            <ul className="mb-8 flex flex-col gap-3">
              {[
                "Unlimited items",
                "Unlimited collections",
                "AI-powered tagging & search",
                "File & image uploads",
                "Priority support",
              ].map((item) => (
                <li key={item} className="relative pl-7 text-sm text-[#a1a1aa]">
                  <span className="absolute left-0 text-green-500 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
            >
              Upgrade to Pro
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

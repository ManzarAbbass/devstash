"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function Nav() {
  const navRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50)
    }
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-[#0f0f11]/80 backdrop-blur-md transition-all duration-300",
        scrolled && "border-b border-[#27272a] bg-[#0f0f11]/95"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5 text-xl font-bold text-[#f4f4f5]">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">
            D
          </div>
          <span>DevStash</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]">
            Pricing
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href="/sign-in">
            <Button variant="ghost" className="text-[#a1a1aa] hover:text-[#f4f4f5]">
              Sign In
            </Button>
          </a>
          <a href="/register">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-0">
              Get Started
            </Button>
          </a>
        </div>

        <button
          className="flex flex-col justify-center gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-6 text-[#f4f4f5]" /> : <Menu className="size-6 text-[#f4f4f5]" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-80 border-b border-[#27272a]" : "max-h-0"
        )}
      >
        <div className="flex flex-col gap-3 bg-[#18181b] px-6 pb-5 pt-3">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]"
          >
            Pricing
          </a>
          <hr className="border-[#27272a]" />
          <a href="/sign-in" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full text-[#a1a1aa] hover:text-[#f4f4f5]">
              Sign In
            </Button>
          </a>
          <a href="/register" onClick={() => setMobileOpen(false)}>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-0">
              Get Started
            </Button>
          </a>
        </div>
      </div>


    </nav>
  )
}

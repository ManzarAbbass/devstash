"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Search, PanelLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar"

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <div className="flex w-40 items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
            D
          </div>
          <span className="text-sm font-semibold">DevStash</span>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." className="pl-8" />
        </div>
        <div className="flex w-40 items-center justify-end gap-2">
          <Button variant="outline" size="sm">
            New Collection
          </Button>
          <Button size="sm">
            <Plus className="size-4" />
            New Item
          </Button>
          {isMobile && (
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open sidebar" />
                }
              >
                <PanelLeft className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent collapsed={false} />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

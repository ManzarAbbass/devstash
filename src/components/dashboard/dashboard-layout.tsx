"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Search, PanelLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/dashboard/sidebar"

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
        {isMobile ? (
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open sidebar" />
              }
            >
              <PanelLeft className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <PanelLeft className="size-4" />
          </Button>
        )}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." className="pl-8" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            New Collection
          </Button>
          <Button size="sm">
            <Plus className="size-4" />
            New Item
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && sidebarOpen && (
          <aside className="w-60 shrink-0 border-r border-border">
            <SidebarContent />
          </aside>
        )}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

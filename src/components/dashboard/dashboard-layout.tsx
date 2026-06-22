"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Search, PanelLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar"
import { CreateItemDialog } from "@/components/items/create-item-dialog"
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog"
import { CreateItemContext } from "@/lib/create-item-context"
import type { SidebarData } from "@/lib/db/items"

export function DashboardLayout({ children, sidebarData }: { children: ReactNode; sidebarData: SidebarData }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dialogInitialType, setDialogInitialType] = useState<string | undefined>()
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)

  const typeFromPath = pathname.match(/^\/items\/(\w+)/)?.[1]
  const typeName = typeFromPath ? (typeFromPath.endsWith("s") ? typeFromPath.slice(0, -1) : typeFromPath) : undefined

  const openDialog = useCallback((initialType?: string) => {
    setDialogInitialType(initialType)
    setCreateDialogOpen(true)
  }, [])

  const handleNewItemClick = useCallback(() => {
    openDialog(typeName)
  }, [openDialog, typeName])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <CreateItemContext.Provider value={{ openDialog }}>
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
            <Button variant="outline" size="sm" onClick={() => setCollectionDialogOpen(true)}>
              New Collection
            </Button>
            <Button size="sm" onClick={handleNewItemClick}>
              <Plus className="size-4" />
              New Item
            </Button>
            <CreateItemDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              itemTypes={sidebarData.itemTypes}
              initialType={dialogInitialType}
            />
            <CreateCollectionDialog
              open={collectionDialogOpen}
              onOpenChange={setCollectionDialogOpen}
            />
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
                  <SidebarContent data={sidebarData} collapsed={false} />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <Sidebar data={sidebarData} />}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </CreateItemContext.Provider>
  )
}

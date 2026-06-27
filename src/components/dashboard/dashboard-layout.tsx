"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, PanelLeft, Plus, Star, FolderPlus, FilePlus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar"
import { CreateItemDialog } from "@/components/items/create-item-dialog"
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog"
import { CreateItemContext } from "@/lib/create-item-context"
import { EditorPreferencesContext } from "@/lib/editor-preferences-context"
import { CommandPalette } from "@/components/search/command-palette"
import type { SidebarData } from "@/lib/db/items"
import type { SearchData } from "@/lib/db/search"
import type { EditorPreferences } from "@/lib/editor-preferences"
import { defaultEditorPreferences } from "@/lib/editor-preferences"

export function DashboardLayout({ children, sidebarData, searchData }: { children: ReactNode; sidebarData: SidebarData; searchData: SearchData }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dialogInitialType, setDialogInitialType] = useState<string | undefined>()
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const typeFromPath = pathname.match(/^\/items\/(\w+)/)?.[1]
  const typeName = typeFromPath ? (typeFromPath.endsWith("s") ? typeFromPath.slice(0, -1) : typeFromPath) : undefined

  const [editorPrefs, setEditorPrefs] = useState<EditorPreferences>(defaultEditorPreferences)

  useEffect(() => {
    fetch("/api/settings/editor-preferences")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setEditorPrefs(data) })
      .catch(() => {})
  }, [])

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

  const updateEditorPrefs = useCallback((prefs: Partial<EditorPreferences>) => {
    setEditorPrefs((prev) => ({ ...prev, ...prefs }))
  }, [])

  return (
    <CreateItemContext.Provider value={{ openDialog }}>
    <EditorPreferencesContext.Provider value={{ preferences: editorPrefs, updatePreferences: updateEditorPrefs }}>
      <div className="flex h-screen flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-2">
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
          <Link href="/dashboard" className="flex md:w-40 items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
              D
            </div>
            <span className="hidden md:inline text-sm font-semibold">DevStash</span>
          </Link>
          <div className="relative mx-auto hidden md:block w-full max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Search items...  ⌘K"
              className="pl-8 cursor-pointer"
              onClick={() => setSearchOpen(true)}
            />
          </div>
          <div className="flex items-center justify-end gap-1 max-md:ml-auto">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search className="size-4" />
              </Button>
            )}
            <Link
              href="/favorites"
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Favorites"
            >
              <Star className="size-4" />
            </Link>
            {!isMobile && (
              <>
                <Button variant="outline" size="sm" onClick={() => setCollectionDialogOpen(true)}>
                  New Collection
                </Button>
                <Button size="sm" onClick={handleNewItemClick}>
                  <Plus className="size-4" />
                  New Item
                </Button>
              </>
            )}
            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="default" size="icon" aria-label="Create" />}
                >
                  <Plus className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuPositioner align="end">
                    <DropdownMenuPopup>
                      <DropdownMenuItem onClick={() => setCollectionDialogOpen(true)}>
                        <FolderPlus className="size-4" />
                        New Collection
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleNewItemClick}>
                        <FilePlus className="size-4" />
                        New Item
                      </DropdownMenuItem>
                    </DropdownMenuPopup>
                  </DropdownMenuPositioner>
                </DropdownMenuPortal>
              </DropdownMenu>
            )}
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
            <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} data={searchData} />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <Sidebar data={sidebarData} />}
          <main className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{children}</main>
        </div>
      </div>
    </EditorPreferencesContext.Provider>
    </CreateItemContext.Provider>
  )
}

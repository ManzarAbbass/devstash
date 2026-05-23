import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, PanelLeft, Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Button variant="ghost" size="icon" aria-label="Toggle sidebar">
          <PanelLeft className="size-4" />
        </Button>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
          />
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
        <aside className="w-60 shrink-0 border-r border-border p-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Sidebar</h2>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-lg font-semibold text-muted-foreground">Main</h2>
        </main>
      </div>
    </div>
  )
}

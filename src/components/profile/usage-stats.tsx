import { Layers, Archive, Code2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { iconMap } from "@/lib/icons"
import type { ProfileStats } from "@/lib/db/users"

interface UsageStatsProps {
  stats: ProfileStats
}

export function UsageStats({ stats }: UsageStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Layers className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Archive className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{stats.totalCollections}</p>
              <p className="text-xs text-muted-foreground">Collections</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-3 text-sm font-medium">Items by Type</p>
          <div className="space-y-2">
            {stats.itemTypeBreakdown.map((type) => {
              const TypeIcon = iconMap[type.icon] || Code2
              return (
                <div key={type.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="size-4" style={{ color: type.color }} />
                    <span className="text-sm">{type.name}</span>
                  </div>
                  <span className="text-sm font-medium">{type.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

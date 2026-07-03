"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { Code2 } from "lucide-react"

import { iconMap } from "@/lib/icons"
import { Badge } from "@/components/ui/badge"
import type { SidebarData } from "@/lib/db/items"

interface SidebarItemTypesProps {
  itemTypes: SidebarData["itemTypes"]
  collapsed: boolean
  isPro: boolean
  linkClass: string
  iconOnlyClass: string
}

export function SidebarItemTypes({ itemTypes, collapsed, isPro, linkClass, iconOnlyClass }: SidebarItemTypesProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {!collapsed && (
        <button
          type="button"
          className="flex items-center gap-1 px-1 py-1 text-xs font-medium text-muted-foreground"
        >
          <ChevronDown className="size-3" />
          Types
        </button>
      )}
      <nav className="flex flex-col gap-0.5">
        {itemTypes.map((type) => {
          const Icon = iconMap[type.icon] || Code2
          const isLocked = (type.name === "file" || type.name === "image") && !isPro
          return collapsed ? (
            isLocked ? (
              <span
                key={type.id}
                className={`${iconOnlyClass} opacity-50`}
                title={`${type.name}s (Pro)`}
              >
                <Icon className="size-4" style={{ color: type.color }} />
              </span>
            ) : (
              <Link
                key={type.id}
                href={`/items/${type.name}s`}
                className={iconOnlyClass}
                title={`${type.name}s`}
              >
                <Icon className="size-4" style={{ color: type.color }} />
              </Link>
            )
          ) : isLocked ? (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                toast.error("This feature requires a Pro subscription")
                router.push("/upgrade")
              }}
              className={`${linkClass} w-full opacity-50`}
            >
              <Icon className="size-4 shrink-0" style={{ color: type.color }} />
              <span className="flex-1 capitalize">{type.name}s</span>
              <Badge variant="outline" className="text-[10px] leading-none px-1 py-0 h-4 bg-purple-600 text-white border-purple-500">PRO</Badge>
              <span className="text-xs text-muted-foreground">{type.count}</span>
            </button>
          ) : (
            <Link
              key={type.id}
              href={`/items/${type.name}s`}
              className={linkClass}
            >
              <Icon className="size-4 shrink-0" style={{ color: type.color }} />
              <span className="flex-1 capitalize">{type.name}s</span>
              {(type.name === "file" || type.name === "image") && (
                <Badge variant="outline" className="text-[10px] leading-none px-1 py-0 h-4 bg-purple-600 text-white border-purple-500">PRO</Badge>
              )}
              <span className="text-xs text-muted-foreground">{type.count}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

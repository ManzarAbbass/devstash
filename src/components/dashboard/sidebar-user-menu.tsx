"use client"

import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Settings, User, LogOut } from "lucide-react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { SidebarData } from "@/lib/db/items"

interface SidebarUserMenuProps {
  user: SidebarData["user"]
  collapsed: boolean
}

export function SidebarUserMenu({ user, collapsed }: SidebarUserMenuProps) {
  const router = useRouter()

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={collapsed ? (
          <div className="flex justify-center px-2 py-3" />
        ) : (
          <div className="flex items-center gap-3 px-3 py-3" />
        )}
      >
        <Avatar size="sm">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className={collapsed ? "text-[10px]" : undefined}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        )}
        {!collapsed && (
          <Settings className="size-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuPositioner side="top" align="end" sideOffset={4}>
          <DropdownMenuPopup>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/sign-in" })}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuPopup>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

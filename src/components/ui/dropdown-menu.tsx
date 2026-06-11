"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn("cursor-default", className)}
      {...props}
    />
  )
}

function DropdownMenuPortal({ className, ...props }: MenuPrimitive.Portal.Props) {
  return (
    <MenuPrimitive.Portal
      data-slot="dropdown-menu-portal"
      className={cn("z-50", className)}
      {...props}
    />
  )
}

function DropdownMenuPositioner({ className, ...props }: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Positioner
      data-slot="dropdown-menu-positioner"
      className={cn("z-50", className)}
      {...props}
    />
  )
}

function DropdownMenuPopup({ className, ...props }: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Popup
      data-slot="dropdown-menu-popup"
      className={cn(
        "min-w-40 origin-[--anchor-side] overflow-hidden rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md transition-all duration-150 ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-[side=bottom]:data-starting-style:translate-y-1 data-[side=bottom]:data-ending-style:translate-y-1 data-[side=top]:data-starting-style:-translate-y-1 data-[side=top]:data-ending-style:-translate-y-1",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
}

"use client"

import { Select } from "@base-ui/react/select"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function SelectRoot({
  value,
  onValueChange,
  children,
  disabled,
  label,
}: {
  value?: string
  onValueChange?: (value: string | null) => void
  children?: React.ReactNode
  disabled?: boolean
  label?: string
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger aria-label={label}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-border bg-background px-2.5 py-1 text-sm text-foreground shadow-sm outline-none transition-all",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=open]:border-ring"
        )}
      >
        <Select.Value placeholder="Select..." />
        <Select.Icon>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup
            className={cn(
              "z-50 min-w-[var(--anchor-width)] overflow-hidden rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
            )}
          >
            {children}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}

export function SelectItem({
  value,
  children,
}: {
  value: string
  children?: React.ReactNode
}) {
  return (
    <Select.Item
      value={value}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
      )}
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
}

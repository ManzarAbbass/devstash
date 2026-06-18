"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCreateItem } from "@/lib/create-item-context"

interface AddItemButtonProps {
  type: string
}

export function AddItemButton({ type }: AddItemButtonProps) {
  const { openDialog } = useCreateItem()

  return (
    <Button size="sm" onClick={() => openDialog(type)}>
      <Plus className="size-4" />
      New {type.charAt(0).toUpperCase() + type.slice(1)}
    </Button>
  )
}

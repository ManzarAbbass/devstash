"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DeleteAccountConfirmationProps {
  onConfirm: (password?: string) => Promise<void>
  onCancel: () => void
  hasPassword: boolean
}

export function DeleteAccountConfirmation({
  onConfirm,
  onCancel,
  hasPassword,
}: DeleteAccountConfirmationProps) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(hasPassword ? password : undefined)
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
      <p className="mb-3 text-sm font-medium text-destructive">Are you sure you want to delete your account?</p>
      <p className="mb-4 text-sm text-muted-foreground">
        This action is irreversible. All your data (items, collections, and account info) will be permanently deleted.
      </p>
      {hasPassword && (
        <Input
          type="password"
          placeholder="Enter your password to confirm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
      )}
      <div className="flex gap-2">
        <Button variant="destructive" onClick={handleConfirm} disabled={loading || (hasPassword && !password)}>
          {loading ? "Deleting..." : "Delete my account"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

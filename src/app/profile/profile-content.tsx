"use client"

import { useState } from "react"
import { Mail, Calendar, Key, Trash2, ShieldCheck, Layers, Archive, Code2, Sparkles, Terminal, StickyNote, File, Image, Link2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { UserProfile, ProfileStats } from "@/lib/db/users"

const iconMap: Record<string, typeof Code2> = {
  Code: Code2,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) return email[0].toUpperCase()
  return "U"
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function DeleteConfirmation({
  onConfirm,
  onCancel,
  hasPassword,
}: {
  onConfirm: (password?: string) => Promise<void>
  onCancel: () => void
  hasPassword: boolean
}) {
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

export function ProfileContent({
  profile,
  stats,
}: {
  profile: UserProfile
  stats: ProfileStats
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setChangingPassword(true)
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      toast.success("Password changed successfully")
      setChangePasswordOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (password?: string) => {
    try {
      const res = await fetch("/api/profile/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      toast.success("Account deleted")
      await signOut({ callbackUrl: "/sign-in" })
    } catch {
      toast.error("Something went wrong")
    }
  }

  const initials = getInitials(profile.name, profile.email)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={profile.image ?? undefined} alt={profile.name ?? "Avatar"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{profile.name ?? "User"}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span>Joined {formatDate(profile.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <span>{profile.hasPassword ? "Email & Password" : "GitHub OAuth"}</span>
          </div>
        </CardContent>
      </Card>

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

      {profile.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            {changePasswordOpen ? (
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                <Key className="size-4" />
                Change Password
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <DeleteConfirmation
              onConfirm={handleDeleteAccount}
              onCancel={() => setShowDeleteConfirm(false)}
              hasPassword={profile.hasPassword}
            />
          ) : (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="size-4" />
              Delete Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Mail, Calendar, Trash2, ShieldCheck } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

import { getInitials, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UsageStats } from "@/components/profile/usage-stats"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountConfirmation } from "@/components/profile/delete-account-confirmation"
import type { UserProfile, ProfileStats } from "@/lib/db/users"

export function ProfileContent({
  profile,
  stats,
}: {
  profile: UserProfile
  stats: ProfileStats
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

      <UsageStats stats={stats} />

      {profile.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <DeleteAccountConfirmation
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

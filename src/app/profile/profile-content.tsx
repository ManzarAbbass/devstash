"use client"

import { Mail, Calendar, ShieldCheck } from "lucide-react"

import { getInitials, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UsageStats } from "@/components/profile/usage-stats"
import type { UserProfile, ProfileStats } from "@/lib/db/users"

export function ProfileContent({
  profile,
  stats,
}: {
  profile: UserProfile
  stats: ProfileStats
}) {
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
    </div>
  )
}

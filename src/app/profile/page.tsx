import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getUserProfile, getProfileStats } from "@/lib/db/users"
import { ProfileContent } from "./profile-content"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, profile, stats] = await Promise.all([
    getSidebarData(userId),
    getUserProfile(userId),
    getProfileStats(userId),
  ])

  return (
    <DashboardLayout sidebarData={sidebarData}>
      <ProfileContent profile={profile} stats={stats} />
    </DashboardLayout>
  )
}

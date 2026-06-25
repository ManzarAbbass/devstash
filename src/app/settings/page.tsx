import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getUserProfile } from "@/lib/db/users"
import { SettingsContent } from "./settings-content"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, searchData, profile] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getUserProfile(userId),
  ])

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <SettingsContent profile={profile} />
    </DashboardLayout>
  )
}

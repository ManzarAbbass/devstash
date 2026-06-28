import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getUserProfile, getEditorPreferences } from "@/lib/db/users"
import { STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID } from "@/lib/stripe"
import { SettingsContent } from "./settings-content"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, searchData, profile, editorPrefs] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getUserProfile(userId),
    getEditorPreferences(userId),
  ])

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <SettingsContent
        profile={profile}
        editorPrefs={editorPrefs}
        monthlyPriceId={STRIPE_MONTHLY_PRICE_ID}
        yearlyPriceId={STRIPE_YEARLY_PRICE_ID}
      />
    </DashboardLayout>
  )
}

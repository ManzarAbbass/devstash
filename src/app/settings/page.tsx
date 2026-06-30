import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getUserProfile, getEditorPreferences } from "@/lib/db/users"
import { getStripe, getStripePriceId } from "@/lib/stripe"
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

  let currentPlan = null as "monthly" | "yearly" | null
  if (profile.isPro && profile.stripeSubscriptionId) {
    try {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId)
      const priceId = subscription.items.data[0]?.price.id
      if (priceId === getStripePriceId(true)) currentPlan = "monthly"
      else if (priceId === getStripePriceId(false)) currentPlan = "yearly"
    } catch {}
  }

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <SettingsContent
        profile={profile}
        editorPrefs={editorPrefs}
        monthlyPriceId={getStripePriceId(true)}
        yearlyPriceId={getStripePriceId(false)}
        currentPlan={currentPlan}
      />
    </DashboardLayout>
  )
}

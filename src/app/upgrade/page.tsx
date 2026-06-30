import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"
import { getStripePriceId } from "@/lib/stripe"
import { UpgradeContent } from "./upgrade-content"

export const dynamic = "force-dynamic"

export default async function UpgradePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [sidebarData, searchData] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
  ])

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <UpgradeContent
        isPro={session.user.isPro ?? false}
        monthlyPriceId={getStripePriceId(true)}
        yearlyPriceId={getStripePriceId(false)}
      />
    </DashboardLayout>
  )
}

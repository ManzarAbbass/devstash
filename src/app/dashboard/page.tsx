import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MainContent } from "@/components/dashboard/main-content"
import { DashboardContentSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { getSidebarData } from "@/lib/db/items"
import { getSearchData } from "@/lib/db/search"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id
  const [sidebarData, searchData] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
  ])

  return (
    <DashboardLayout sidebarData={sidebarData} searchData={searchData}>
      <Suspense fallback={<DashboardContentSkeleton />}>
        <MainContent userId={userId} />
      </Suspense>
    </DashboardLayout>
  )
}

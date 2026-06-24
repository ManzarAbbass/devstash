import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MainContent } from "@/components/dashboard/main-content"
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
      <MainContent userId={userId} />
    </DashboardLayout>
  )
}

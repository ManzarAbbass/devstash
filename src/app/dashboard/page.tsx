import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MainContent } from "@/components/dashboard/main-content"
import { getDemoUserId } from "@/lib/db/collections"
import { getSidebarData } from "@/lib/db/items"

export default async function DashboardPage() {
  const userId = await getDemoUserId()
  const sidebarData = await getSidebarData(userId)

  return (
    <DashboardLayout sidebarData={sidebarData}>
      <MainContent />
    </DashboardLayout>
  )
}

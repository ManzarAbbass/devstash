import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MainContent } from "@/components/dashboard/main-content"
import { getSidebarData } from "@/lib/db/items"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id
  const sidebarData = await getSidebarData(userId)

  return (
    <DashboardLayout sidebarData={sidebarData}>
      <MainContent userId={userId} />
    </DashboardLayout>
  )
}

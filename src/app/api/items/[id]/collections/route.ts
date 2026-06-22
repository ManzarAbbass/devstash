import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getItemCollectionIds } from "@/lib/db/items"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ids = await getItemCollectionIds(session.user.id, id)
    return NextResponse.json(ids)
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filekey: string[] }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.isPro) {
      return NextResponse.json(
        { error: "Upgrade to Pro to download files" },
        { status: 403 }
      )
    }

    const { filekey } = await params
    const key = filekey.join("/")

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(key)

    if (error || !data) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const headers = new Headers()
    headers.set("Content-Type", data.type)
    headers.set(
      "Content-Disposition",
      `attachment; filename="${key.split("/").pop()}"`
    )

    return new NextResponse(data, { status: 200, headers })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

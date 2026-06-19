import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  supabaseAdmin,
  STORAGE_BUCKET,
  IMAGE_MAX_SIZE,
  FILE_MAX_SIZE,
  isImageFile,
  isAllowedFile,
} from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!isAllowedFile(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed` },
        { status: 400 }
      )
    }

    const maxSize = isImageFile(file.type) ? IMAGE_MAX_SIZE : FILE_MAX_SIZE

    if (file.size > maxSize) {
      const limit = isImageFile(file.type) ? "5 MB" : "10 MB"
      return NextResponse.json(
        { error: `File exceeds maximum size of ${limit}` },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop() ?? ""
    const key = `${session.user.id}/${crypto.randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET)

    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
        public: true,
      })
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(key)

    return NextResponse.json({
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileKey: key,
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

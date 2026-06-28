import { Download, File, Lock, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatFileSize } from "@/lib/utils"

interface FileDisplayProps {
  fileUrl: string
  fileName: string | null
  fileSize: number | null
  typeName: string
  onDownload: () => void
  isPro?: boolean
}

export function FileDisplay({ fileUrl, fileName, fileSize, typeName, onDownload, isPro }: FileDisplayProps) {
  const router = useRouter()

  if (!isPro) {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {typeName === "image" ? "Image" : "File"}
          </h3>
          <Badge variant="outline" className="text-[10px] leading-none px-1 py-0 h-4">PRO</Badge>
        </div>
        <div className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-border p-6 text-center" onClick={() => router.push("/settings")}>
          <Lock className="size-8 text-muted-foreground/50" />
          <div>
            <p className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground">
              <Crown className="size-4" />
              Pro feature
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Upgrade to Pro to view and download {typeName === "image" ? "images" : "files"}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {typeName === "image" ? "Image" : "File"}
        </h3>
        {typeName === "image" && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-1.5 size-3.5" />
            Download
          </Button>
        )}
      </div>
      <div className="rounded-lg border border-border p-3">
        {typeName === "image" ? (
          <div className="overflow-hidden rounded">
            <img
              src={fileUrl}
              alt={fileName ?? "Image"}
              className="w-full rounded object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
              <File className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{fileName}</p>
              {fileSize != null && (
                <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="mr-1.5 size-3.5" />
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

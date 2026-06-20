import { Download, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/lib/utils"

interface FileDisplayProps {
  fileUrl: string
  fileName: string | null
  fileSize: number | null
  typeName: string
  onDownload: () => void
}

export function FileDisplay({ fileUrl, fileName, fileSize, typeName, onDownload }: FileDisplayProps) {
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

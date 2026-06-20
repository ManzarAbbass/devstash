"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, File, X, ImageIcon } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "done"; fileUrl: string; fileName: string; fileSize: number }
  | { status: "error"; message: string }

interface FileUploadProps {
  accept: string
  maxSize: number
  onUploadComplete: (data: { fileUrl: string; fileName: string; fileSize: number }) => void
  onRemove: () => void
  currentFile?: { fileName: string; fileUrl: string } | null
}

export function FileUpload({ accept, maxSize, onUploadComplete, onRemove, currentFile }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" })
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isImage = accept.split(",").some((t) => t.includes("image"))

  const handleFile = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      const limit = maxSize / (1024 * 1024)
      setUploadState({ status: "error", message: `File exceeds ${limit} MB` })
      return
    }

    setUploadState({ status: "uploading", progress: 0 })

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadState({ status: "uploading", progress: Math.round((e.loaded / e.total) * 100) })
      }
    }

    return new Promise<void>((resolve) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          setUploadState({ status: "done", ...data })
          onUploadComplete({ fileUrl: data.fileUrl, fileName: data.fileName, fileSize: data.fileSize })
        } else {
          try {
            const err = JSON.parse(xhr.responseText)
            setUploadState({ status: "error", message: err.error || "Upload failed" })
          } catch {
            setUploadState({ status: "error", message: "Upload failed" })
          }
        }
        resolve()
      }

      xhr.onerror = () => {
        setUploadState({ status: "error", message: "Network error" })
        resolve()
      }

      const formData = new FormData()
      formData.append("file", file)
      xhr.open("POST", "/api/upload")
      xhr.send(formData)
    })
  }, [maxSize, onUploadComplete])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (e.target) e.target.value = ""
  }

  function handleRemove() {
    setUploadState({ status: "idle" })
    onRemove()
  }

  if (uploadState.status === "done" || currentFile) {
    const fileName = uploadState.status === "done"
      ? (uploadState as any).fileName
      : currentFile!.fileName
    const fileUrl = uploadState.status === "done"
      ? (uploadState as any).fileUrl
      : currentFile!.fileUrl
    const fileSize = uploadState.status === "done"
      ? (uploadState as any).fileSize
      : null

    return (
      <div className="relative rounded-lg border border-border p-3">
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
        <div className="flex items-center gap-3">
          {isImage ? (
            <div className="size-10 shrink-0 overflow-hidden rounded">
              <img src={fileUrl} alt={fileName} className="size-full object-cover" />
            </div>
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
              <File className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileName}</p>
            {fileSize != null && (
              <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (uploadState.status === "uploading") {
    const progress = (uploadState as any).progress
    return (
      <div className="rounded-lg border border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-sm">
          <Upload className="size-4 animate-pulse text-primary" />
          <span className="text-muted-foreground">Uploading...</span>
          <span className="ml-auto text-xs text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors ${
          dragOver
            ? "border-primary bg-primary/5 text-primary"
            : "border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50"
        } ${uploadState.status === "error" ? "border-destructive" : ""}`}
      >
        {isImage ? (
          <ImageIcon className="size-8" />
        ) : (
          <Upload className="size-8" />
        )}
        <span className="font-medium">
          {isImage ? "Drop an image here" : "Drop a file here"}
        </span>
        <span className="text-xs">or click to browse</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {uploadState.status === "error" && (
        <p className="mt-1 text-xs text-destructive">{(uploadState as any).message}</p>
      )}
    </div>
  )
}



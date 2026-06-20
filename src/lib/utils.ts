import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function extractFileKey(publicUrl: string): string {
  const url = new URL(publicUrl)
  const segments = url.pathname.split("/")
  const storageIndex = segments.indexOf("devstash")
  return segments.slice(storageIndex + 1).join("/")
}

export function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) return email[0].toUpperCase()
  return "U"
}

export function formatDate(date: Date, style: "long" | "short" = "long") {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  })
}

export function extractStorageKey(publicUrl: string): string | null {
  const url = new URL(publicUrl)
  const segments = url.pathname.split("/")
  const storageIndex = segments.indexOf("devstash")
  if (storageIndex === -1) return null
  return segments.slice(storageIndex + 1).join("/")
}

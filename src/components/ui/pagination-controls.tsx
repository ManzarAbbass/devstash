import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function PaginationControls({ currentPage, totalPages, baseUrl }: PaginationControlsProps) {
  if (totalPages <= 1) return null

  const pages = generatePageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous</span>
        </Link>
      ) : (
        <Link
          href="#"
          aria-disabled
          tabIndex={-1}
          className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground/50 pointer-events-none"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous</span>
        </Link>
      )}

      {pages.map((page, i) => {
        if (page === "...") {
          return <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">...</span>
        }
        const isCurrent = page === currentPage
        return (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm",
              isCurrent
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {page}
          </Link>
        )
      })}

      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next</span>
        </Link>
      ) : (
        <Link
          href="#"
          aria-disabled
          tabIndex={-1}
          className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground/50 pointer-events-none"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next</span>
        </Link>
      )}
    </nav>
  )
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = [1]

  if (current > 3) {
    pages.push("...")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push("...")
  }

  if (total > 1) {
    pages.push(total)
  }

  return pages
}

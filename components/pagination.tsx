"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "./icons"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push("...")

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push("...")

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 glass rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/50 transition-all duration-300 group"
      >
        <ChevronLeftIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      </button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-[40px] h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
              page === currentPage
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : page === "..."
                  ? "cursor-default text-muted-foreground"
                  : "glass hover:bg-secondary/50 text-foreground hover:text-primary"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 glass rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/50 transition-all duration-300 group"
      >
        <ChevronRightIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      </button>
    </div>
  )
}

import React from "react"
import { cn } from "@/lib/utils"

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  const style: React.CSSProperties = { width: size, height: size }
  return (
    <svg className={cn("animate-spin text-blue-600", className)} viewBox="0 0 24 24" style={style}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-background/60 backdrop-blur-sm">
      <div className="flex items-center space-x-3 rounded-md border bg-background px-4 py-3 shadow">
        <Spinner size={22} />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  )
}

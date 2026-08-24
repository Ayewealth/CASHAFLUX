import { Skeleton } from '../ui/skeleton'

interface PageSkeletonProps {
  rows?: number
  className?: string
}

export default function PageSkeleton({ rows = 5, className = '' }: PageSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-60 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-surface border-b-2 border-brand-navy/10 p-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-border/40">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
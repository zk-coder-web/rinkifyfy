'use client'

import { cn } from '@/lib/utils'

/* ── Base skeleton component ── */
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height 
}: SkeletonProps) {
  return (
    <div 
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-dark-border',
        variant === 'text' && 'rounded h-4',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      style={{ width, height }}
    />
  )
}

/* ── Card skeleton ── */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-5">
        <Skeleton variant="circular" width={56} height={56} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    </div>
  )
}

/* ── Page skeleton ── */
export function PageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

/* ── List skeleton ── */
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-dark-border">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Form skeleton ── */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton variant="text" width={80} height={12} />
        <Skeleton height={48} />
      </div>
      <div className="space-y-1.5">
        <Skeleton variant="text" width={80} height={12} />
        <Skeleton height={48} />
      </div>
      <Skeleton height={48} />
    </div>
  )
}

/* ── Button skeleton ── */
export function ButtonSkeleton({ width = '100%' }: { width?: string | number }) {
  return <Skeleton height={48} width={width} className="" />
}
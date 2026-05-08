'use client';

// ============================================================================
// LoadingShimmer — Skeleton loading placeholder
// ============================================================================

interface LoadingShimmerProps {
  /** Width — defaults to 'w-full' */
  width?: string;
  /** Height Tailwind class — defaults to 'h-4' */
  height?: string;
  /** Border radius class — defaults to 'rounded-lg' */
  rounded?: string;
  className?: string;
}

export function LoadingShimmer({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-lg',
  className = '',
}: LoadingShimmerProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`shimmer ${width} ${height} ${rounded} ${className}`}
    />
  );
}

/** Pre-built skeleton for an ActivityCard */
export function ActivityCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading activity"
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <LoadingShimmer width="w-8" height="h-8" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <LoadingShimmer height="h-4" width="w-3/4" />
          <LoadingShimmer height="h-3" width="w-1/2" />
        </div>
        <LoadingShimmer width="w-16" height="h-6" rounded="rounded-full" />
      </div>
      <LoadingShimmer height="h-3" />
      <LoadingShimmer height="h-3" width="w-5/6" />
    </div>
  );
}

/** Pre-built skeleton for a DayCard */
export function DayCardSkeleton() {
  return (
    <div role="status" aria-label="Loading day" className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <LoadingShimmer width="w-10" height="h-10" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <LoadingShimmer height="h-5" width="w-1/3" />
          <LoadingShimmer height="h-3" width="w-1/2" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}

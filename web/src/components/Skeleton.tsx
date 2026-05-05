import { cn } from '../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-sand/60', className)} />;
}

export function NetWorthSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-sand bg-ivory px-4 py-3">
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AssetListSkeleton() {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <Skeleton className="h-4 w-20 mb-3" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between px-3 py-2 border-b border-sand/40 last:border-0"
        >
          <div>
            <Skeleton className="h-3.5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 flex items-center justify-center h-[320px]">
      <Skeleton className="h-40 w-40 rounded-full" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

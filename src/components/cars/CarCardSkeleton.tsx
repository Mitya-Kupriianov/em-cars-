export function CarCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border-0 bg-card shadow-sm">
      <div className="aspect-[16/10] bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="flex gap-4">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="mt-2 h-7 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

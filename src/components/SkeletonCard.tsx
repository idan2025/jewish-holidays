export function SkeletonCard() {
  return (
    <div className="card rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
      <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6" />
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

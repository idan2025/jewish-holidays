import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

/** Renders nicely with Tailwind *or* with CSS fallback (.badge). */
export function Badge({ children, className = "" }: BadgeProps) {
  const tw =
    "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium " +
    "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100";
  return <span className={`badge ${tw} ${className}`.trim()}>{children}</span>;
}

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="mb-4">{error.message}</p>
      <button
        className="rounded-md border px-3 py-1 text-sm"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}

export function ErrorMessage({
  message,
  onRetry,
  hebrewUI = false,
}: {
  message?: string;
  onRetry?: () => void;
  hebrewUI?: boolean;
}) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm text-red-800 dark:text-red-200">
        {message ||
          (hebrewUI ? "אירעה שגיאה בטעינת הנתונים" : "Error loading data")}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          aria-label={hebrewUI ? "נסה שוב" : "Retry"}
        >
          {hebrewUI ? "נסה שוב" : "Retry"}
        </button>
      )}
    </div>
  );
}

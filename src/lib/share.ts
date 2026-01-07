export async function shareHoliday(
  title: string,
  text: string,
  url?: string
): Promise<boolean> {
  const shareData = {
    title,
    text,
    url: url || window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
      return false;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${title}\n${text}\n${shareData.url}`);
    return true;
  } catch {
    return false;
  }
}

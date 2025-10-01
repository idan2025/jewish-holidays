import "./globals.css";
import type { Metadata } from "next";

/* Set theme before paint to avoid flash */
const themeInitScript = `
(() => {
  try {
    const t = localStorage.getItem('theme');
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && sysDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
})();
`;

export const metadata: Metadata = {
  title: "Jewish Holidays & Timers",
  description: "Hebrew + Gregorian calendar with precise start/end timers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}

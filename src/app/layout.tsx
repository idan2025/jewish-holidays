import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jewish Holidays & Timers",
  description: "A webapp that shows Jewish holidays, times, and live countdowns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

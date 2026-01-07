import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Jewish Holidays & Timers | Zmanim & Hebrew Calendar",
  description:
    "Track Jewish holidays, Shabbat times, Zmanim (prayer times), and Parashat Hashavua with live countdowns. Support for cities across Israel with Hebrew and English.",
  keywords: [
    "Jewish holidays",
    "Shabbat times",
    "Zmanim",
    "Hebrew calendar",
    "Parashat Hashavua",
    "candle lighting",
    "Havdalah",
    "Israel",
  ],
  authors: [{ name: "Jewish Holidays" }],
  creator: "Jewish Holidays",
  publisher: "Jewish Holidays",
  robots: "index, follow",
  alternates: {
    canonical: "https://jh.cloudt.info",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "he_IL",
    url: "https://jh.cloudt.info",
    title: "Jewish Holidays & Timers",
    description:
      "Track Jewish holidays, Shabbat times, and Zmanim with live countdowns",
    siteName: "Jewish Holidays & Timers",
  },
  twitter: {
    card: "summary",
    title: "Jewish Holidays & Timers",
    description: "Track Jewish holidays and Shabbat times with live countdowns",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Jewish Holidays & Timers",
    applicationCategory: "LifestyleApplication",
    description:
      "Track Jewish holidays, Shabbat times, Zmanim, and Parashat Hashavua with live countdowns",
    url: "https://jh.cloudt.info",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Jewish holiday calendar",
      "Shabbat times",
      "Zmanim (prayer times)",
      "Parashat Hashavua",
      "Live countdowns",
      "Multiple Israeli cities",
      "Hebrew and English support",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

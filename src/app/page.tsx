"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import Countdown from "@/src/components/Countdown";
import { Badge } from "@/src/components/Badge";
import { ISRAEL_CITIES } from "@/src/lib/israelCities";
import { HDate } from "@hebcal/hdate";

type HebItem = {
  title: string;
  date: string;
  hdate?: string;
  category?: string;
  hebrew?: string; // localized title when lg=he-x-NoNikud
};

type HebcalHolidays = { items: HebItem[] };

type HebcalTimesItem = {
  title: string;
  hebrew?: string;
  date: string;
  category?: "candles" | "havdalah" | "parashat" | "fast" | string;
};

type HebcalTimes = { items: HebcalTimesItem[] };

// Helper: Gregorian Date -> Hebrew date label (Hebrew with gematria, no nikud)
function hebrewDateLabel(d: Date) {
  try {
    const hd = new HDate(d);
    // @ts-ignore types may lag behind
    return (hd.renderGematriya?.() ?? hd.render?.()) as string;
  } catch {
    return "";
  }
}

// Robust language-agnostic start/end picker
function pickStartEnd(
  items: HebcalTimesItem[],
  now: Date,
  hebrewUI: boolean
): { start: Date | null; end: Date | null } {
  const parsed = items
    .map((i) => ({ ...i, when: new Date(i.date) }))
    .sort((a, b) => +a.when - +b.when);

  const upcoming = parsed.filter((i) => +i.when > +now);
  const text = (i: HebcalTimesItem) => (i.hebrew ?? i.title ?? "");

  // Regex for fast begin/end in both languages (no nikud Hebrew)
  const fastBeginRe = hebrewUI
    ? /(תחילת|תחלת)\s*צום|צום\s*מתחיל/i
    : /fast\s*begins?/i;

  const fastEndRe = hebrewUI
    ? /(סיום|סוף)\s*צום|צום\s*מסתיים/i
    : /fast\s*ends?/i;

  const isStart = (i: HebcalTimesItem) =>
    i.category === "candles" || (i.category === "fast" && fastBeginRe.test(text(i)));

  const isEnd = (i: HebcalTimesItem) =>
    i.category === "havdalah" || (i.category === "fast" && fastEndRe.test(text(i)));

  const startItem = upcoming.find(isStart) ?? parsed.find(isStart) ?? null;
  const endItem = upcoming.find(isEnd) ?? parsed.find(isEnd) ?? null;

  return {
    start: startItem ? (startItem.when as Date) : null,
    end: endItem ? (endItem.when as Date) : null,
  };
}

export default function Home() {
  const defaultCity =
    ISRAEL_CITIES.find((c) => c.name === "Jerusalem") ?? ISRAEL_CITIES[0];

  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [tz, setTz] = useState<string>(selectedCity.tz);
  const [monthData, setMonthData] = useState<HebItem[]>([]);
  const [times, setTimes] = useState<HebcalTimesItem[]>([]);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  // UI language: false = English, true = Hebrew (no nikud)
  const [hebrewUI, setHebrewUI] = useState<boolean>(false);

  // THEME: 'light' | 'dark'
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.classList.toggle("dark") ? "dark" : "light";
    setTheme(next);
    try { localStorage.setItem("theme", next); } catch {}
  };

  // Try geolocation to auto-pick nearest city
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords;
        const nearest =
          ISRAEL_CITIES.map((c) => ({
            c,
            d: Math.hypot(c.lat - latitude, c.lon - longitude),
          })).sort((a, b) => a.d - b.d)[0]?.c;
        if (nearest) {
          setSelectedCity(nearest);
          setTz(nearest.tz);
        }
      },
      () => {} // ignore denied
    );
  }, []);

  // Fetch month holidays & today’s times for the chosen city.
  // Language is enforced via lg=en or lg=he-x-NoNikud
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lg = hebrewUI ? "he-x-NoNikud" : "en";

    (async () => {
      const holidaysRes = await fetch(
        `/api/holidays?year=${year}&month=${month}&geonameid=${selectedCity.geonameid}&lg=${lg}`
      );
      const holidays: HebcalHolidays = await holidaysRes.json();
      setMonthData(holidays.items || []);

      const timesRes = await fetch(
        `/api/times?geonameid=${selectedCity.geonameid}&lg=${lg}`
      );
      const timesJson: HebcalTimes = await timesRes.json();
      const items = (timesJson.items || []) as HebcalTimesItem[];
      setTimes(items);

      const { start, end } = pickStartEnd(items, new Date(), hebrewUI);
      setStart(start);
      setEnd(end);
    })();
  }, [selectedCity, hebrewUI]);

  // Pick today's holiday (language-agnostic by category)
  const todayHoliday = useMemo(() => {
    const iso = new Date().toISOString().slice(0, 10);
    return monthData.find(
      (it) =>
        it.date?.startsWith(iso) &&
        /holiday|fast|חג|צום/i.test(it.category || "")
    );
  }, [monthData]);

  const containerClass = `mx-auto max-w-3xl p-4 md:p-8 ${hebrewUI ? "rtl" : ""}`;

  return (
    <main className={containerClass}>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">
          {hebrewUI ? "חגים וזמנים — שעונים חיים" : "Jewish Holidays & Timers"}
        </h1>
        <div className="flex items-center gap-2">
          {/* City picker */}
          <select
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            value={selectedCity.geonameid}
            onChange={(e) => {
              const city = ISRAEL_CITIES.find(
                (c) => c.geonameid === Number(e.target.value)
              );
              if (city) {
                setSelectedCity(city);
                setTz(city.tz);
              }
            }}
            title={hebrewUI ? "בחר עיר" : "Choose city"}
          >
            {ISRAEL_CITIES.map((c) => (
              <option key={c.geonameid} value={c.geonameid}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Timezone (editable) */}
          <select
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            title="Timezone"
          >
            <option value={selectedCity.tz}>{selectedCity.tz}</option>
            <option value="UTC">UTC</option>
          </select>

          {/* Language toggle */}
          <button
            className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            onClick={() => setHebrewUI((v) => !v)}
            title="Toggle language"
          >
            {hebrewUI ? "EN" : "עברית"}
          </button>

          {/* Theme toggle */}
          <button
            className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            onClick={toggleTheme}
            title="Toggle dark mode"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Today card */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>{formatInTimeZone(new Date(), tz, "PPP")}</Badge>
          <Badge>{selectedCity.name}</Badge>
          <Badge>{tz}</Badge>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {hebrewUI ? "היום" : "Today"}
        </h2>
        <p className="mb-2">
          {todayHoliday
            ? hebrewUI
              ? todayHoliday.hebrew ?? todayHoliday.title
              : todayHoliday.title
            : hebrewUI
            ? "אין חג מיוחד היום"
            : "No major holiday today"}
        </p>

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-sm opacity-70">
              {hebrewUI
                ? "התחלה (הדלקת נרות / תחילת צום)"
                : "Start (Candle lighting / Fast begins)"}
            </div>
            <div className="text-lg font-medium">
              {start ? formatInTimeZone(start, tz, "HH:mm:ss") : "—"}
            </div>
            <div className="text-sm">
              <Countdown target={start} />
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-sm opacity-70">
              {hebrewUI
                ? "סיום (הבדלה / סוף צום)"
                : "End (Havdalah / Fast ends)"}
            </div>
            <div className="text-lg font-medium">
              {end ? formatInTimeZone(end, tz, "HH:mm:ss") : "—"}
            </div>
            <div className="text-sm">
              <Countdown target={end} />
            </div>
          </div>
        </div>

        <details className="mt-3">
          <summary className="cursor-pointer text-sm opacity-70">
            {hebrewUI ? "זמנים מפורטים" : "Detailed times"}
          </summary>
          <ul className="mt-2 space-y-1 text-sm">
            {times.map((t, idx) => (
              <li key={idx}>
                <span className="font-medium">
                  {hebrewUI ? t.hebrew ?? t.title : t.title}
                </span>
                {" — "}
                {formatInTimeZone(new Date(t.date), tz, "PPpp")}
              </li>
            ))}
          </ul>
        </details>
      </section>

      {/* Month list */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-3">
          {hebrewUI ? "החודש" : "This Month"}
        </h2>
        <ul className="space-y-2">
          {monthData.map((e, i) => {
            const g = new Date(e.date);
            const leftTitle = hebrewUI ? e.hebrew ?? e.title : e.title;
            const rightDateEn = formatInTimeZone(g, tz, "PP");
            const rightDateHe = hebrewUI ? hebrewDateLabel(g) : "";

            return (
              <li
                key={i}
                className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="font-medium">{leftTitle}</div>
                <div className="text-sm opacity-80">
                  {rightDateEn}
                  {hebrewUI && rightDateHe ? ` • ${rightDateHe}` : ""}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

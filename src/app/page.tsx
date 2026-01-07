"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  Countdown,
  Badge,
  LoadingSpinner,
  ErrorMessage,
  SkeletonCard,
} from "../components";
import {
  ISRAEL_CITIES,
  generateICS,
  downloadICS,
  requestNotificationPermission,
  notifyUpcoming,
  shareHoliday,
} from "../lib";
import { HDate } from "@hebcal/hdate";

type HebItem = {
  title: string;
  date: string;
  hdate?: string;
  category?: string;
  hebrew?: string;
  memo?: string;
};

type HebcalHolidays = { items: HebItem[] };

type HebcalTimesItem = {
  title: string;
  hebrew?: string;
  date: string;
  category?: "candles" | "havdalah" | "parashat" | "fast" | string;
};

type HebcalTimes = { items: HebcalTimesItem[] };

type Zmanim = {
  times: {
    sunrise?: string;
    sunset?: string;
    dawn?: string;
    dusk?: string;
    alotHaShachar?: string;
    misheyakir?: string;
    sofZmanShma?: string;
    sofZmanTfilla?: string;
    chatzot?: string;
    minchaGedola?: string;
    minchaKetana?: string;
    plagHaMincha?: string;
    tzeit?: string;
  };
  location: {
    title?: string;
  };
};

function hebrewDateLabel(d: Date) {
  try {
    const hd = new HDate(d) as unknown as {
      renderGematriya?: () => string;
      render?: () => string;
    };
    const out = hd.renderGematriya?.() ?? hd.render?.() ?? "";
    return typeof out === "string" ? out : "";
  } catch {
    return "";
  }
}

function pickStartEnd(
  items: HebcalTimesItem[],
  now: Date,
  hebrewUI: boolean
): { start: Date | null; end: Date | null } {
  const parsed = items
    .map((i) => ({ ...i, when: new Date(i.date) }))
    .sort((a, b) => +a.when - +b.when);

  const upcoming = parsed.filter((i) => +i.when > +now);
  const text = (i: HebcalTimesItem) => i.hebrew ?? i.title ?? "";

  const fastBeginRe = hebrewUI
    ? /(תחילת|תחלת)\s*צום|צום\s*מתחיל/i
    : /fast\s*begins?/i;

  const fastEndRe = hebrewUI
    ? /(סיום|סוף)\s*צום|צום\s*מסתיים/i
    : /fast\s*ends?/i;

  const isStart = (i: HebcalTimesItem) =>
    i.category === "candles" ||
    (i.category === "fast" && fastBeginRe.test(text(i)));

  const isEnd = (i: HebcalTimesItem) =>
    i.category === "havdalah" ||
    (i.category === "fast" && fastEndRe.test(text(i)));

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
  const [zmanim, setZmanim] = useState<Zmanim | null>(null);
  const [parashat, setParashat] = useState<string | null>(null);

  const [hebrewUI, setHebrewUI] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const applyTheme = useCallback((mode: "light" | "dark") => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("dark");
    body.classList.remove("dark");

    if (mode === "dark") {
      html.classList.add("dark");
      body.classList.add("dark");
    }

    html.style.colorScheme = mode;
    const meta = document.querySelector(
      'meta[name="color-scheme"]'
    ) as HTMLMetaElement | null;
    if (meta) meta.content = mode;
  }, []);

  useEffect(() => {
    try {
      const stored =
        (localStorage.getItem("theme") as "light" | "dark" | null) || null;
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      const initial = stored ?? (prefersDark ? "dark" : "light");
      setTheme(initial);
      applyTheme(initial);
    } catch {}
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    applyTheme(next);
  }, [theme, applyTheme]);

  // Request notification permission
  useEffect(() => {
    requestNotificationPermission().then(setNotificationsEnabled);
  }, []);

  // Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords;
        const nearest = ISRAEL_CITIES.map((c) => ({
          c,
          d: Math.hypot(c.lat - latitude, c.lon - longitude),
        })).sort((a, b) => a.d - b.d)[0]?.c;
        if (nearest) {
          setSelectedCity(nearest);
          setTz(nearest.tz);
        }
      },
      () => {}
    );
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const lg = hebrewUI ? "he-x-NoNikud" : "en";

      const [holidaysRes, timesRes, zmanimRes] = await Promise.all([
        fetch(
          `/api/holidays?year=${year}&month=${month}&geonameid=${selectedCity.geonameid}&lg=${lg}`
        ),
        fetch(`/api/times?geonameid=${selectedCity.geonameid}&lg=${lg}`),
        fetch(`/api/zmanim?geonameid=${selectedCity.geonameid}&date=now`),
      ]);

      if (!holidaysRes.ok || !timesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const holidays: HebcalHolidays = await holidaysRes.json();
      const timesJson: HebcalTimes = await timesRes.json();
      const zmanimJson: Zmanim = zmanimRes.ok ? await zmanimRes.json() : null;

      setMonthData(holidays.items || []);

      const items = (timesJson.items || []) as HebcalTimesItem[];
      setTimes(items);

      const { start, end } = pickStartEnd(items, new Date(), hebrewUI);
      setStart(start);
      setEnd(end);

      setZmanim(zmanimJson);

      // Find Parashat Hashavua
      const parasha = items.find((i) => i.category === "parashat");
      setParashat(
        parasha ? (hebrewUI ? parasha.hebrew ?? parasha.title : parasha.title) : null
      );

      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
      setLoading(false);
    }
  }, [selectedCity, hebrewUI]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Notify 15 minutes before events
  useEffect(() => {
    if (!notificationsEnabled || !start) return;

    const now = new Date().getTime();
    const timeUntil = start.getTime() - now;
    const fifteenMinutes = 15 * 60 * 1000;

    if (timeUntil > fifteenMinutes && timeUntil < fifteenMinutes + 60000) {
      notifyUpcoming(
        hebrewUI ? "זמן הדלקת נרות מתקרב" : "Candle lighting approaching",
        15
      );
    }
  }, [start, notificationsEnabled, hebrewUI]);

  const todayHoliday = useMemo(() => {
    const iso = new Date().toISOString().slice(0, 10);
    return monthData.find(
      (it) =>
        it.date?.startsWith(iso) && /holiday|fast|חג|צום/i.test(it.category || "")
    );
  }, [monthData]);

  const handleExport = useCallback(
    (holiday: HebItem) => {
      const title = hebrewUI ? holiday.hebrew ?? holiday.title : holiday.title;
      const ics = generateICS(
        title,
        new Date(holiday.date),
        null,
        holiday.memo,
        selectedCity.name
      );
      downloadICS(ics, `${title.replace(/\s+/g, "_")}.ics`);
    },
    [hebrewUI, selectedCity.name]
  );

  const handleShare = useCallback(
    async (holiday: HebItem) => {
      const title = hebrewUI ? holiday.hebrew ?? holiday.title : holiday.title;
      const text = formatInTimeZone(new Date(holiday.date), tz, "PPP");
      const success = await shareHoliday(title, text);
      if (!success) {
        alert(hebrewUI ? "הועתק ללוח" : "Copied to clipboard");
      }
    },
    [hebrewUI, tz]
  );

  const containerClass = `container-fallback mx-auto max-w-3xl p-4 md:p-8 ${
    hebrewUI ? "rtl" : ""
  }`;

  if (loading) {
    return (
      <main className={containerClass}>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={containerClass}>
        <div className="flex justify-center items-center min-h-screen">
          <ErrorMessage message={error} onRetry={fetchData} hebrewUI={hebrewUI} />
        </div>
      </main>
    );
  }

  return (
    <main className={containerClass}>
      <header className="headerbar mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">
          {hebrewUI ? "חגים וזמנים — שעונים חיים" : "Jewish Holidays & Timers"}
        </h1>
        <div className="controls flex items-center gap-2">
          <select
            className="select rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
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
            aria-label={hebrewUI ? "בחירת עיר" : "City selection"}
          >
            {ISRAEL_CITIES.map((c) => (
              <option key={c.geonameid} value={c.geonameid}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="select rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            title="Timezone"
            aria-label="Timezone selection"
          >
            <option value={selectedCity.tz}>{selectedCity.tz}</option>
            <option value="UTC">UTC</option>
          </select>

          <button
            className="btn rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            onClick={() => setHebrewUI((v) => !v)}
            title={hebrewUI ? "החלף לאנגלית" : "Switch to Hebrew"}
            aria-label={hebrewUI ? "החלף לאנגלית" : "Toggle language"}
          >
            {hebrewUI ? "EN" : "עברית"}
          </button>

          <button
            className="btn rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            onClick={toggleTheme}
            title={theme === "dark" ? "מצב בהיר" : "Dark mode"}
            aria-label={`Toggle ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Parashat Hashavua */}
      {parashat && (
        <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-3">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {hebrewUI ? "פרשת השבוע: " : "This week's Parasha: "}
            <span className="font-bold">{parashat}</span>
          </p>
        </div>
      )}

      {/* Today card */}
      <section
        className="card mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-labelledby="today-heading"
      >
        <div className="badges mb-2 flex flex-wrap items-center gap-2">
          <Badge>{formatInTimeZone(new Date(), tz, "PPP")}</Badge>
          <Badge>{selectedCity.name}</Badge>
          <Badge>{tz}</Badge>
        </div>

        <h2 id="today-heading" className="text-xl font-semibold mb-2">
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

        <div className="grid2 mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="kv rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="label text-sm opacity-70">
              {hebrewUI
                ? "התחלה (הדלקת נרות / תחילת צום)"
                : "Start (Candle lighting / Fast begins)"}
            </div>
            <div className="value text-lg font-medium">
              {start ? formatInTimeZone(start, tz, "HH:mm:ss") : "—"}
            </div>
            <div className="text-sm">
              <Countdown target={start} />
            </div>
          </div>
          <div className="kv rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="label text-sm opacity-70">
              {hebrewUI
                ? "סיום (הבדלה / סוף צום)"
                : "End (Havdalah / Fast ends)"}
            </div>
            <div className="value text-lg font-medium">
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

      {/* Zmanim section */}
      {zmanim?.times && (
        <section
          className="card mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          aria-labelledby="zmanim-heading"
        >
          <h2 id="zmanim-heading" className="text-xl font-semibold mb-3">
            {hebrewUI ? "זמנים" : "Zmanim (Prayer Times)"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {zmanim.times.sunrise && (
              <div className="text-sm">
                <span className="opacity-70">{hebrewUI ? "נץ החמה:" : "Sunrise:"}</span>
                <br />
                <span className="font-medium">
                  {formatInTimeZone(new Date(zmanim.times.sunrise), tz, "HH:mm")}
                </span>
              </div>
            )}
            {zmanim.times.sunset && (
              <div className="text-sm">
                <span className="opacity-70">{hebrewUI ? "שקיעה:" : "Sunset:"}</span>
                <br />
                <span className="font-medium">
                  {formatInTimeZone(new Date(zmanim.times.sunset), tz, "HH:mm")}
                </span>
              </div>
            )}
            {zmanim.times.alotHaShachar && (
              <div className="text-sm">
                <span className="opacity-70">{hebrewUI ? "עלות השחר:" : "Alot HaShachar:"}</span>
                <br />
                <span className="font-medium">
                  {formatInTimeZone(new Date(zmanim.times.alotHaShachar), tz, "HH:mm")}
                </span>
              </div>
            )}
            {zmanim.times.sofZmanShma && (
              <div className="text-sm">
                <span className="opacity-70">{hebrewUI ? "סוף זמן ק\"ש:" : "Latest Shema:"}</span>
                <br />
                <span className="font-medium">
                  {formatInTimeZone(new Date(zmanim.times.sofZmanShma), tz, "HH:mm")}
                </span>
              </div>
            )}
            {zmanim.times.sofZmanTfilla && (
              <div className="text-sm">
                <span className="opacity-70">{hebrewUI ? "סוף זמן תפילה:" : "Latest Tefilla:"}</span>
                <br />
                <span className="font-medium">
                  {formatInTimeZone(new Date(zmanim.times.sofZmanTfilla), tz, "HH:mm")}
                </span>
              </div>
            )}
            {zmanim.times.tzeit && (
              <div className="text-sm">
                <span className="opacity-70">{hebrewUI ? "צאת הכוכבים:" : "Nightfall:"}</span>
                <br />
                <span className="font-medium">
                  {formatInTimeZone(new Date(zmanim.times.tzeit), tz, "HH:mm")}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Month list */}
      <section
        className="card rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-labelledby="month-heading"
      >
        <h2 id="month-heading" className="text-xl font-semibold mb-3">
          {hebrewUI ? "החודש" : "This Month"}
        </h2>
        <ul className="list space-y-2">
          {monthData.map((e, i) => {
            const g = new Date(e.date);
            const leftTitle = hebrewUI ? e.hebrew ?? e.title : e.title;
            const rightDateEn = formatInTimeZone(g, tz, "PP");
            const rightDateHe = hebrewUI ? hebrewDateLabel(g) : "";

            return (
              <li
                key={i}
                className="list-item flex flex-col md:flex-row md:items-center md:justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 gap-2"
              >
                <div className="item-title font-medium flex-1">{leftTitle}</div>
                <div className="flex items-center gap-2">
                  <div className="item-sub text-sm opacity-80">
                    {rightDateEn}
                    {hebrewUI && rightDateHe ? ` • ${rightDateHe}` : ""}
                  </div>
                  <button
                    onClick={() => handleExport(e)}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    title={hebrewUI ? "ייצא ליומן" : "Export to calendar"}
                    aria-label={`${hebrewUI ? "ייצא" : "Export"} ${leftTitle}`}
                  >
                    📅
                  </button>
                  <button
                    onClick={() => handleShare(e)}
                    className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    title={hebrewUI ? "שתף" : "Share"}
                    aria-label={`${hebrewUI ? "שתף" : "Share"} ${leftTitle}`}
                  >
                    🔗
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

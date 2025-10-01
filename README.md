Jewish Holidays & Timers (Next.js)

A modern, mobile-first web app that shows Jewish holidays & Hebrew/Gregorian dates and provides second-precision timers for start (candle lighting / fast begins) and end (havdalah / fast ends).
Built with Next.js 15, React 19, Tailwind CSS v4, and TypeScript. Supports city-specific times (e.g., Afula ≠ Jerusalem), Hebrew (no nikud) / English toggle, RTL, and Dark mode.

Features

📅 Month view with Hebrew + Gregorian dates

⏱️ Live timers (to the second) for start/end of today’s chag/fast

🏙️ Per-city times via Hebcal (choose Afula, Jerusalem, etc.)

🌍 Auto-detect nearest city (optional, via browser geolocation)

🌗 Dark / Light mode toggle (persists in localStorage)

🌐 i18n toggle:

English UI → English event titles/dates

Hebrew (no nikud) UI → Hebrew titles + Hebrew date (gematria), RTL

📱 Responsive (phone, tablet, desktop)

🔒 Privacy-friendly (no user data stored; location stays client-side)

Tech Stack

Frontend/SSR: Next.js 15 (App Router), React 19, TypeScript

Styling: Tailwind CSS v4 (@tailwindcss/postcss)

Dates: date-fns-tz, @hebcal/hdate

Data source: Hebcal REST APIs (Shabbat/Times + Jewish Calendar)

Quick Start
# 1) Install deps
npm i

# 2) Run dev server
npm run dev
# http://localhost:3000


Requires Node.js 18+ (recommended 20+). The Docker image uses Node 22-alpine.

Project Structure
src/
  app/
    api/
      holidays/route.ts     # Month holidays (lg=en | he-x-NoNikud, location-aware)
      times/route.ts        # Zmanim & holiday times (candles/havdalah/fasts)
    globals.css             # Tailwind v4 + helpers (+ dark variant)
    layout.tsx              # App shell + pre-paint theme init
    page.tsx                # UI: city/language/theme toggles, timers, month list
  components/
    Badge.tsx
    Countdown.tsx
  lib/
    israelCities.ts         # City list (name, geonameid, tz, lat/lon)
postcss.config.mjs          # Tailwind v4 PostCSS plugin
next.config.mjs             # output: "standalone" (for Docker)

Configuration
Language (EN / HE no-nikud)

UI toggle button flips between:

lg=en

lg=he-x-NoNikud

Hebrew dates (e.g., כ״ט באלול תשפ״ה) rendered with @hebcal/hdate (gematria, no nikud).

City / Location

src/lib/israelCities.ts contains a curated list of Israeli cities with geonameid (used by Hebcal).

The app picks the nearest city on first load if the user grants geolocation.

You can expand the list or connect a search box to a larger city index.

Havdalah Offset

Default is tzeit + 50 minutes (Hebcal param m=50).

Change in src/app/api/times/route.ts.

Dark Mode

Tailwind v4 @custom-variant dark on the <html>.dark class.

A small inline script in layout.tsx sets theme before paint to avoid flash.

Scripts
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint"
}


If CI has issues with Turbopack, switch to "next build" / "next dev".

Docker (Production)

Files already included: Dockerfile, .dockerignore, next.config.mjs (output: "standalone")

# Build
docker build -t jewish-holidays .

# Run
docker run --rm -p 3000:3000 jewish-holidays
# http://localhost:3000


Optional docker-compose.yml:

services:
  web:
    build: .
    image: jewish-holidays:latest
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped

Favicon & Icons

Two approaches (pick one):

Recommended: file-based in src/app/

src/app/icon.png (square PNG, 32–512px)

src/app/favicon.ico (optional)

src/app/apple-icon.png (optional, 180×180)

Explicit via public/ + metadata.icons in layout.tsx.

How It Works (High Level)

Times & Holidays from Hebcal:

/api/times → Shabbat/Times (geonameid preferred; or lat/lon+tz; language via lg)

/api/holidays → Jewish Calendar (month), location-aware, language via lg

Timer Detection is language-agnostic:

Uses category (e.g., candles, havdalah, fast)

Only falls back to regex for distinguishing fast begins/ends (both EN & HE supported)

Hebrew & No Nikud:

API returns localized titles (hebrew field) when lg=he-x-NoNikud

Hebrew date line is rendered locally with @hebcal/hdate

Troubleshooting

CommonJS vs ESM error: Ensure "type": "module" in package.json.

Tailwind error: Use Tailwind v4 with @tailwindcss/postcss. postcss.config.mjs should be:

export default { plugins: { '@tailwindcss/postcss': {} } };


In globals.css, import Tailwind v4:

@import "tailwindcss";


Timers show “—”: There may be no upcoming candle/fast/havdalah event for the current day/time in the selected city, or the date is a weekday without events.

Roadmap

📦 PWA (installable, offline shell)

🧭 City search with full index (and global cities)

📊 Full calendar grid (Hebrew numerals inside day boxes)

🛫 Diaspora/Israel toggle & minhag presets

📡 Offline zmanim using @hebcal/core / kosher-zmanim

Acknowledgements

Hebcal for holiday & zmanim data.

@hebcal/hdate for Hebrew date rendering.

License

MIT — see LICENSE (or choose your preferred license).
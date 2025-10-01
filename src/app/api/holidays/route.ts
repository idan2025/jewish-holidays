import { NextResponse } from "next/server";

/**
 * Jewish calendar for a given month, with language-aware titles and Hebrew date parts.
 * Location impacts Israel vs Diaspora handling and candle-lighting markers.
 *
 * Query:
 *   - ?geonameid=NNNN (preferred)
 *   - ?year & ?month (default: current)
 *   - ?lg=en | he-x-NoNikud
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const now = new Date();

  const year  = Number(searchParams.get("year")  ?? now.getFullYear());
  const month = Number(searchParams.get("month") ?? (now.getMonth() + 1));
  const geonameid = searchParams.get("geonameid");
  const lg = searchParams.get("lg") || "en"; // default English

  const url = new URL("https://www.hebcal.com/hebcal");
  url.searchParams.set("v", "1");
  url.searchParams.set("cfg", "json");
  url.searchParams.set("maj", "on");
  url.searchParams.set("min", "on");
  url.searchParams.set("mod", "on");
  url.searchParams.set("nx",  "on");
  url.searchParams.set("year", String(year));
  url.searchParams.set("month", String(month));
  url.searchParams.set("mf", "on");    // month names
  url.searchParams.set("c",  "on");    // candle-lighting markers in titles
  url.searchParams.set("lg", lg);      // language toggle
  url.searchParams.set("hdp", "1");    // include heDateParts when available

  if (geonameid) {
    url.searchParams.set("geo", "geoname");
    url.searchParams.set("geonameid", geonameid);
  } else {
    // Fallback: assume Israel calendar
    url.searchParams.set("i", "on");
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

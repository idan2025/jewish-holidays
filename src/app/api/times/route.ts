import { NextResponse } from "next/server";

/**
 * Zmanim / holiday times (candle lighting, havdalah, fast begins/ends).
 * Accepts either:
 *   - ?geonameid=NNNN    (preferred)
 *   - or ?lat & ?lon & ?tz
 * Language:
 *   - ?lg=en  -> English
 *   - ?lg=he-x-NoNikud -> Hebrew without nikud
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const geonameid = searchParams.get("geonameid");
  const lg = searchParams.get("lg") || "en"; // default English unless specified

  const url = new URL("https://www.hebcal.com/shabbat");
  url.searchParams.set("cfg", "json");
  url.searchParams.set("lg", lg);
  url.searchParams.set("m", "50"); // Havdalah = tzeit + 50 (adjust as desired)

  if (geonameid) {
    url.searchParams.set("geonameid", geonameid);
  } else {
    const lat = searchParams.get("lat") ?? "31.778";
    const lon = searchParams.get("lon") ?? "35.235";
    const tz  = searchParams.get("tz")  ?? "Asia/Jerusalem";
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("tzid", tz);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

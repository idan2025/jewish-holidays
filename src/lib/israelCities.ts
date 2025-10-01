export type City = {
  name: string;
  geonameid: number;
  lat: number;
  lon: number;
  tz: string;
};

export const ISRAEL_CITIES: City[] = [
  { name: "Jerusalem", geonameid: 281184, lat: 31.783, lon: 35.217, tz: "Asia/Jerusalem" },
  { name: "Tel Aviv",  geonameid: 293397, lat: 32.085, lon: 34.781, tz: "Asia/Jerusalem" },
  { name: "Haifa",     geonameid: 294801, lat: 32.815, lon: 34.989, tz: "Asia/Jerusalem" },
  { name: "Beersheba", geonameid: 295530, lat: 31.252, lon: 34.791, tz: "Asia/Jerusalem" },
  { name: "Netanya",   geonameid: 294071, lat: 32.321, lon: 34.853, tz: "Asia/Jerusalem" },
  { name: "Ashdod",    geonameid: 295629, lat: 31.806, lon: 34.655, tz: "Asia/Jerusalem" },
  { name: "Tiberias",  geonameid: 293322, lat: 32.792, lon: 35.531, tz: "Asia/Jerusalem" },
  { name: "Afula",     geonameid: 295740, lat: 32.608, lon: 35.289, tz: "Asia/Jerusalem" },
];
